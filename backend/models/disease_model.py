"""
Disease Prediction Model Loader
================================
Loads the trained MobileNetV2 .keras model and exposes a predict() function
that accepts a preprocessed numpy array and returns class name + confidence.
"""

import os
import logging
import numpy as np
from config import DISEASE_MODEL_PATH, DISEASE_CLASS_NAMES, DISEASE_SOLUTIONS

logger = logging.getLogger(__name__)

# Force Keras 3 to use the PyTorch backend instead of TensorFlow (avoids Windows DLL crashes)
os.environ["KERAS_BACKEND"] = "torch"
# Disable PyTorch's dynamo compiler to prevent cl.exe missing compiler errors on Windows
os.environ["TORCH_COMPILE_DISABLE"] = "1"

import keras

# ── Global handle ──────────────────────────────────────────────────────────────
_model = None
_keras_available = True

def load_model():
    """Load the .keras model into memory (called once at app startup)."""
    global _model
        
    if _model is None:
        print(f"  [..]  Loading disease model from {DISEASE_MODEL_PATH} via PyTorch backend...")
        _model = keras.saving.load_model(DISEASE_MODEL_PATH)
        print("  [..]  Warming up model to prevent first-request timeout...")
        dummy_input = np.zeros((1, 224, 224, 3), dtype=np.float32)
        _model.predict(dummy_input, verbose=0)
        print("  [OK]  Disease model loaded and warmed up successfully using PyTorch!")
    return _model

def predict(image_array: np.ndarray) -> dict:
    model = load_model()

    predictions = model.predict(image_array, verbose=0)
    
    predicted_idx = int(np.argmax(predictions[0]))
    confidence = float(np.max(predictions[0])) * 100

    class_name = DISEASE_CLASS_NAMES[predicted_idx]
    solution_info = DISEASE_SOLUTIONS.get(class_name, {})

    # Top-3 predictions for extra context
    top3_indices = np.argsort(predictions[0])[::-1][:3]
    top3 = [
        {
            "class": DISEASE_CLASS_NAMES[i],
            "confidence": round(float(predictions[0][i]) * 100, 2),
        }
        for i in top3_indices
    ]

    is_healthy = "healthy" in class_name.lower()

    return {
        "class_name": class_name,
        "disease": solution_info.get("disease", class_name.replace("___", " — ")),
        "cause": solution_info.get("cause", "Unknown"),
        "confidence": round(confidence, 2),
        "solution": solution_info.get("solution", "Consult a local agronomist."),
        "is_healthy": is_healthy,
        "top_predictions": top3,
    }
