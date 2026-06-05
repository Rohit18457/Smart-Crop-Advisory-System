"""
/crop-recommend  —  Crop Recommendation Endpoint
==================================================
POST  /crop-recommend  (JSON body)
  • Input:  { N, P, K, temperature, humidity, ph, rainfall }
  • Output: Best crop + confidence + top-5 alternatives
"""

import logging

from flask import Blueprint, request, jsonify
from models.crop_model import predict

logger = logging.getLogger(__name__)

crop_bp = Blueprint("crop", __name__)

# Required fields and their allowed ranges (for basic validation)
REQUIRED_FIELDS = {
    "N":           (0, 200),
    "P":           (0, 200),
    "K":           (0, 300),
    "temperature": (-10, 60),
    "humidity":    (0, 100),
    "ph":          (0, 14),
    "rainfall":    (0, 2000),
}


@crop_bp.route("/crop-recommend", methods=["POST"])
def crop_recommend():
    """Recommend the best crop for given soil and weather conditions."""

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "error": "Request body must be JSON with fields: N, P, K, temperature, humidity, ph, rainfall."
        }), 400

    # ── Validate all required fields ───────────────────────────────────────
    errors = []
    values = {}

    for field, (lo, hi) in REQUIRED_FIELDS.items():
        val = data.get(field)
        if val is None:
            errors.append(f"Missing required field: '{field}'")
            continue
        try:
            val = float(val)
        except (ValueError, TypeError):
            errors.append(f"Field '{field}' must be a number, got '{val}'")
            continue
        if not (lo <= val <= hi):
            errors.append(f"Field '{field}' must be between {lo} and {hi}, got {val}")
            continue
        values[field] = val

    if errors:
        return jsonify({"success": False, "errors": errors}), 400

    # ── Predict ────────────────────────────────────────────────────────────
    try:
        result = predict(
            N=values["N"],
            P=values["P"],
            K=values["K"],
            temperature=values["temperature"],
            humidity=values["humidity"],
            ph=values["ph"],
            rainfall=values["rainfall"],
        )
        return jsonify({"success": True, "recommendation": result}), 200

    except Exception as e:
        logger.exception("Crop recommendation prediction failed")
        return jsonify({
            "success": False,
            "error": "Crop recommendation failed due to an internal error. Please try again."
        }), 500
