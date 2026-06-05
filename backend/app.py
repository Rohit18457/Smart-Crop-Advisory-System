"""
Smart Agriculture Advisory — Flask Backend
=============================================
Entry point for the REST API.

Run:
    python app.py          (development, debug mode)
    gunicorn app:app       (production)
"""

import os
import sys
import logging

# Ensure the backend directory is on sys.path so relative imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from config import SECRET_KEY, UPLOAD_FOLDER, MAX_CONTENT_LENGTH

# ── Structured Logging ────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)

# ── Import route blueprints ───────────────────────────────────────────────────
from routes.disease_routes import disease_bp
from routes.crop_routes import crop_bp
from routes.weather_routes import weather_bp
from routes.market_routes import market_bp
from routes.user_routes import user_bp
from routes.chat_routes import chat_bp

# ── Rate limiter (configurable storage — defaults to in-memory) ───────────────
_ratelimit_storage = os.environ.get("RATELIMIT_STORAGE_URL", "memory://")
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["60 per minute"],
    storage_uri=_ratelimit_storage,
)


def create_app() -> Flask:
    """Application factory — creates and configures the Flask app."""
    app = Flask(__name__)

    # ── Config ─────────────────────────────────────────────────────────────
    app.config["SECRET_KEY"] = SECRET_KEY
    app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
    app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

    # ── CORS (allow frontend to call the API) ──────────────────────────────
    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

    # ── Rate Limiter ───────────────────────────────────────────────────────
    limiter.init_app(app)

    # Apply stricter limits to expensive endpoints
    limiter.limit("10 per minute")(disease_bp)
    limiter.limit("10 per minute")(chat_bp)
    limiter.limit("30 per minute")(crop_bp)

    # ── Register blueprints ────────────────────────────────────────────────
    app.register_blueprint(disease_bp)
    app.register_blueprint(crop_bp)
    app.register_blueprint(weather_bp)
    app.register_blueprint(market_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(chat_bp)

    # ── Security Headers (#17) ─────────────────────────────────────────────
    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response

    # ── Request / Response Logging (#12) ───────────────────────────────────
    @app.after_request
    def log_request(response):
        logger.info(
            "%s %s → %s (%s bytes)",
            request.method,
            request.path,
            response.status_code,
            response.content_length or 0,
        )
        return response

    # ── Health-check / root route ──────────────────────────────────────────
    @app.route("/", methods=["GET"])
    def index():
        return jsonify({
            "status": "online",
            "service": "Smart Agriculture Advisory API",
            "version": "2.0.0",
            "auth": "Supabase JWT",
            "endpoints": {
                "POST /predict-disease": "Upload an image to predict plant disease (10/min, auth required)",
                "POST /crop-recommend": "Get best crop recommendation for soil/weather params (30/min)",
                "GET  /weather?city=": "Fetch current weather for a city",
                "GET  /weather/forecast?city=": "Fetch 5-day forecast for a city",
                "GET  /market-prices": "Get live crop market prices (data.gov.in + fallback)",
                "GET  /market-prices?commodity=": "Filter prices by commodity name",
                "POST /chat": "AI agricultural assistant chat (10/min, auth required)",
                "GET  /user/profile": "Get user identity from Supabase JWT",
            },
        }), 200

    # ── Global error handlers ──────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "error": "Endpoint not found."}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"success": False, "error": "Method not allowed."}), 405

    @app.errorhandler(413)
    def file_too_large(e):
        return jsonify({"success": False, "error": "File too large. Max size is 16 MB."}), 413

    @app.errorhandler(429)
    def rate_limit_exceeded(e):
        return jsonify({"success": False, "error": "Rate limit exceeded. Please slow down."}), 429

    @app.errorhandler(500)
    def internal_error(e):
        logger.exception("Unhandled 500 error")
        return jsonify({"success": False, "error": "Internal server error."}), 500

    return app


# ── Pre-load models at startup (avoids cold-start on first request) ────────
def _preload_models(app):
    """Warm up ML models so first request is fast."""
    with app.app_context():
        logger.info("Smart Agriculture Advisory -- Backend Starting ...")
        logger.info("=" * 55)
        try:
            from models.disease_model import load_model as load_disease
            load_disease()
        except Exception as e:
            logger.warning("Disease model not loaded: %s", e)

        try:
            from models.crop_model import load_model as load_crop
            load_crop()
        except Exception as e:
            logger.warning("Crop model not loaded: %s", e)

        logger.info("=" * 55)
        logger.info("API is ready!")


# ── Main ───────────────────────────────────────────────────────────────────────
app = create_app()
_preload_models(app)  # Fix #25: Always preload, including under Gunicorn

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
        use_reloader=False,  # avoid loading models twice in debug mode
    )
