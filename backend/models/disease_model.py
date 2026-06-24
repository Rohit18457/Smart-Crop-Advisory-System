"""
Disease Prediction Model Loader
================================
Loads the trained MobileNetV2 .tflite model and exposes a predict() function
that accepts a preprocessed numpy array and returns class name + confidence.
"""

import os
import logging
import numpy as np
from config import DISEASE_MODEL_PATH, DISEASE_CLASS_NAMES, DISEASE_SOLUTIONS

logger = logging.getLogger(__name__)

# Try to use lightweight tflite_runtime, fallback to full tensorflow if not available
try:
    import tflite_runtime.interpreter as tflite
    logger.info("Using tflite_runtime for model inference.")
except ImportError:
    try:
        from tensorflow import lite as tflite
        logger.info("Using tensorflow.lite for model inference (fallback).")
    except ImportError:
        logger.error("Neither tflite_runtime nor tensorflow is installed!")
        tflite = None

# ── Global handle ──────────────────────────────────────────────────────────────
_interpreter = None
_input_details = None
_output_details = None

def load_model():
    """Load the .tflite model into memory (called once at app startup)."""
    global _interpreter, _input_details, _output_details
        
    if _interpreter is None:
        print(f"  [..]  Loading disease model from {DISEASE_MODEL_PATH} via TFLite...")
        _interpreter = tflite.Interpreter(model_path=DISEASE_MODEL_PATH)
        _interpreter.allocate_tensors()
        
        _input_details = _interpreter.get_input_details()
        _output_details = _interpreter.get_output_details()
        
        print("  [..]  Warming up model to prevent first-request timeout...")
        dummy_input = np.zeros((1, 224, 224, 3), dtype=np.float32)
        _interpreter.set_tensor(_input_details[0]['index'], dummy_input)
        _interpreter.invoke()
        print("  [OK]  Disease model loaded and warmed up successfully using TFLite!")
    return _interpreter

def predict(image_array: np.ndarray) -> dict:
    load_model()

    _interpreter.set_tensor(_input_details[0]['index'], image_array)
    _interpreter.invoke()
    predictions = _interpreter.get_tensor(_output_details[0]['index'])
    
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
