"""
Crop Recommendation Model Loader
==================================
Loads the trained Random Forest model, StandardScaler and LabelEncoder
and exposes a predict() function.
"""

import numpy as np
import joblib
from config import CROP_MODEL_PATH, CROP_SCALER_PATH, CROP_LABEL_ENCODER_PATH

# ── Global handles ─────────────────────────────────────────────────────────────
_model = None
_scaler = None
_label_encoder = None


def load_model():
    """Load crop recommendation artefacts (called once at startup)."""
    global _model, _scaler, _label_encoder
    if _model is None:
        print(f"  [..]  Loading crop recommendation model ...")
        _model = joblib.load(CROP_MODEL_PATH)
        _scaler = joblib.load(CROP_SCALER_PATH)
        _label_encoder = joblib.load(CROP_LABEL_ENCODER_PATH)
        print("  [OK]  Crop recommendation model loaded successfully!")
    return _model, _scaler, _label_encoder


def predict(N: float, P: float, K: float,
            temperature: float, humidity: float,
            ph: float, rainfall: float) -> dict:
    """
    Predict the best crop for given soil / weather conditions.

    Returns
    -------
    dict with keys: crop, confidence, all_predictions
    """
    model, scaler, label_encoder = load_model()

    features = np.array([[N, P, K, temperature, humidity, ph, rainfall]])
    features_scaled = scaler.transform(features)

    prediction = model.predict(features_scaled)[0]
    probabilities = model.predict_proba(features_scaled)[0]

    crop_name = label_encoder.inverse_transform([prediction])[0]
    confidence = float(np.max(probabilities)) * 100

    # Top-5 crop suggestions
    top5_indices = np.argsort(probabilities)[::-1][:5]
    top5 = [
        {
            "crop": label_encoder.inverse_transform([idx])[0],
            "confidence": round(float(probabilities[idx]) * 100, 2),
        }
        for idx in top5_indices
    ]

    return {
        "crop": crop_name,
        "confidence": round(confidence, 2),
        "top_recommendations": top5,
        "input_params": {
            "N": N, "P": P, "K": K,
            "temperature": temperature,
            "humidity": humidity,
            "ph": ph,
            "rainfall": rainfall,
        },
    }
