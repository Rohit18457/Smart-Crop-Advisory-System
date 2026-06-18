"""
/predict-disease  —  Plant Disease Prediction Endpoint
=======================================================
POST  /predict-disease
  • Accepts: multipart/form-data with an image file field named "image"
  • Returns: JSON with disease name, confidence, cause, solution
"""

import logging

from flask import Blueprint, request, jsonify
from models.disease_model import predict, _keras_available
from utils.image_processing import preprocess_image, allowed_file
from utils.auth import supabase_auth_required

logger = logging.getLogger(__name__)

disease_bp = Blueprint("disease", __name__)

_local_tasks = {}

# Max image file size for this endpoint (10 MB)
_MAX_IMAGE_BYTES = 10 * 1024 * 1024


@disease_bp.route("/predict-disease", methods=["POST"])
@supabase_auth_required
def predict_disease():
    """Handle plant disease prediction from an uploaded image."""

    # ── Validate request ───────────────────────────────────────────────────
    if "image" not in request.files:
        return jsonify({
            "success": False,
            "error": "No image file provided. Please upload an image with the key 'image'."
        }), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({
            "success": False,
            "error": "Empty filename. Please select a valid image file."
        }), 400

    if not allowed_file(file.filename):
        return jsonify({
            "success": False,
            "error": "Invalid file type. Allowed: png, jpg, jpeg, webp, bmp."
        }), 400

    # ── File size validation ───────────────────────────────────────────────
    file.seek(0, 2)  # seek to end
    file_size = file.tell()
    file.seek(0)  # reset to beginning

    if file_size > _MAX_IMAGE_BYTES:
        return jsonify({
            "success": False,
            "error": f"Image too large ({file_size // (1024*1024)} MB). Maximum is 10 MB."
        }), 400

    if file_size == 0:
        return jsonify({
            "success": False,
            "error": "Uploaded file is empty (0 bytes)."
        }), 400

    # ── Preprocess & Predict ───────────────────────────────────────────────
    try:
        import os
        
        use_celery = False
        if _keras_available:
            try:
                import redis
                redis_url = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0")
                redis_client = redis.from_url(redis_url, socket_timeout=1)
                redis_client.ping()
                use_celery = True
            except Exception:
                pass
                
        if use_celery:
            import base64
            from celery_app import predict_disease_task
            
            image_bytes = file.read()
            b64_image = base64.b64encode(image_bytes).decode("utf-8")
            
            task = predict_disease_task.delay(b64_image)
            return jsonify({
                "success": True,
                "task_id": task.id,
                "message": "Prediction started in the background"
            }), 202
        else:
            import time
            import io
            import numpy as np
            from PIL import Image
            
            image_bytes = file.read()
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            image = image.resize((224, 224), Image.LANCZOS)
            img_array = (np.array(image, dtype=np.float32) / 127.5) - 1.0
            img_array = np.expand_dims(img_array, axis=0)
            
            result = predict(img_array)
            
            task_id = f"local_task_{int(time.time() * 1000)}"
            _local_tasks[task_id] = result
            
            return jsonify({
                "success": True,
                "task_id": task_id,
                "message": "Prediction ran locally"
            }), 202

    except Exception as e:
        logger.exception("Disease prediction queuing failed")
        import traceback
        return jsonify({
            "success": False,
            "error": f"Failed to queue prediction: {str(e)}"
        }), 500


@disease_bp.route("/predict-disease/status/<task_id>", methods=["GET"])
@supabase_auth_required
def predict_disease_status(task_id):
    """Check the status of a background disease prediction task."""
    if task_id.startswith("local_task_"):
        result = _local_tasks.get(task_id)
        if result:
            return jsonify({"success": True, "state": "SUCCESS", "prediction": result}), 200
        return jsonify({"success": False, "state": "FAILURE", "error": "Local task not found."}), 200

    try:
        from celery.result import AsyncResult
        from celery_app import celery_app
        
        task_result = AsyncResult(task_id, app=celery_app)
        
        if task_result.state == 'PENDING':
            return jsonify({"success": True, "state": task_result.state, "status": "Pending..."}), 200
        elif task_result.state == 'SUCCESS':
            return jsonify({"success": True, "state": task_result.state, "prediction": task_result.result}), 200
        elif task_result.state == 'FAILURE':
            return jsonify({"success": False, "state": task_result.state, "error": str(task_result.info)}), 200
        else:
            return jsonify({"success": True, "state": task_result.state, "status": str(task_result.info)}), 200
    except Exception as e:
        return jsonify({"success": False, "state": "FAILURE", "error": str(e)}), 500
