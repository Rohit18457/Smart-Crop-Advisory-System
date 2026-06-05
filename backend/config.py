"""
Configuration for Smart Agriculture Flask Backend
==================================================
Centralised settings: model paths, API keys, Flask config.
"""

import os
import warnings
from dotenv import load_dotenv

# Load .env file from the backend directory
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Plant disease CNN model (MobileNetV2, .keras format)
DISEASE_MODEL_PATH = os.path.join(MODELS_DIR, "best_model_20260407_183243.keras")

# Crop recommendation model artefacts
CROP_MODEL_DIR = os.path.join(MODELS_DIR, "CropRecommendation")
CROP_MODEL_PATH = os.path.join(CROP_MODEL_DIR, "random_forest_model.pkl")
CROP_SCALER_PATH = os.path.join(CROP_MODEL_DIR, "scaler.pkl")
CROP_LABEL_ENCODER_PATH = os.path.join(CROP_MODEL_DIR, "label_encoder.pkl")

# ── Image Preprocessing ───────────────────────────────────────────────────────
IMAGE_SIZE = (224, 224)
NUM_DISEASE_CLASSES = 39

# ── API Keys (loaded from .env — NEVER hardcode) ──────────────────────────
OPENWEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY", "")
CROP_PRICE_API_KEY = os.environ.get("CROP_PRICE_API_KEY", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

# Warn at import time if optional API keys are missing
if not OPENWEATHER_API_KEY:
    warnings.warn("OPENWEATHER_API_KEY is not set — weather endpoints will fail.", stacklevel=2)
if not GROQ_API_KEY:
    warnings.warn("GROQ_API_KEY is not set — chat/voice assistant will fail.", stacklevel=2)
if not CROP_PRICE_API_KEY:
    warnings.warn("CROP_PRICE_API_KEY is not set — live market prices unavailable, using mock data.", stacklevel=2)

# ── Supabase (for backend JWT verification) ────────────────────────────────
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")
if not SUPABASE_JWT_SECRET:
    warnings.warn("SUPABASE_JWT_SECRET is not set — authenticated endpoints will fail.", stacklevel=2)

# ── Flask ──────────────────────────────────────────────────────────────────
SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "")
if not SECRET_KEY:
    raise ValueError(
        "FLASK_SECRET_KEY environment variable is required but not set. "
        "Add it to backend/.env — e.g. FLASK_SECRET_KEY=my-strong-random-key"
    )
UPLOAD_FOLDER = os.path.join(BASE_DIR, "backend", "uploads")
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB upload limit

# ── Domain Data (split into separate modules) ─────────────────────────────────
from config_disease import DISEASE_CLASS_NAMES, DISEASE_SOLUTIONS  # noqa: E402, F401
from config_market import MOCK_MARKET_PRICES  # noqa: E402, F401
