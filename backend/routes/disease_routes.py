"""
/predict-disease  —  Plant Disease Prediction Endpoint
=======================================================
POST  /predict-disease
  • Accepts: multipart/form-data with an image file field named "image"
  • Returns: JSON with disease name, confidence, cause, solution
"""

import logging

from flask import Blueprint, request, jsonify
from models.disease_model import predict
from utils.image_processing import preprocess_image, allowed_file
from utils.auth import supabase_auth_required

logger = logging.getLogger(__name__)

disease_bp = Blueprint("disease", __name__)

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
        image_array = preprocess_image(file)
        result = predict(image_array)

        return jsonify({
            "success": True,
            "prediction": result,
        }), 200

    except Exception as e:
        logger.exception("Disease prediction failed")
        import traceback
        return jsonify({
            "success": False,
            "error": f"Prediction failed due to an internal error: {str(e)} | Type: {type(e).__name__}\n{traceback.format_exc()}"
        }), 500
