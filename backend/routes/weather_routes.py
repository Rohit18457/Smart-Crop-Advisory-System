"""
/weather  —  Weather Data Endpoint
=====================================
GET  /weather?city=<city_name>
  • Fetches current weather + 5-day forecast from OpenWeatherMap
  • Returns structured JSON with temperature, humidity, wind, etc.
  • Includes in-memory caching with configurable TTL per city.
"""

import time
import logging

import requests
from flask import Blueprint, request, jsonify
from config import OPENWEATHER_API_KEY

logger = logging.getLogger(__name__)

weather_bp = Blueprint("weather", __name__)

CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather"
FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"

# ── Weather Cache (#14) ───────────────────────────────────────────────────────
_WEATHER_CACHE_TTL = 180  # 3 minutes
_WEATHER_CACHE_MAX = 64
_weather_cache = {}


def _get_cached(cache_key):
    """Return cached data if still valid, else None."""
    entry = _weather_cache.get(cache_key)
    if entry and (time.time() - entry["ts"]) < _WEATHER_CACHE_TTL:
        return entry["data"]
    return None


def _set_cached(cache_key, data):
    """Store data in cache, evicting oldest if full."""
    if len(_weather_cache) >= _WEATHER_CACHE_MAX:
        oldest = min(_weather_cache, key=lambda k: _weather_cache[k]["ts"])
        del _weather_cache[oldest]
    _weather_cache[cache_key] = {"data": data, "ts": time.time()}


@weather_bp.route("/weather", methods=["GET"])
def get_weather():
    """Fetch current weather for a city."""

    city = request.args.get("city")
    if not city:
        return jsonify({
            "success": False,
            "error": "Query parameter 'city' is required.  Example: /weather?city=Mumbai"
        }), 400

    # Check cache
    cache_key = f"current|{city.lower().strip()}"
    cached = _get_cached(cache_key)
    if cached is not None:
        return jsonify({"success": True, "weather": cached, "cached": True}), 200

    try:
        # ── Current weather ────────────────────────────────────────────────
        params = {
            "q": city,
            "appid": OPENWEATHER_API_KEY,
            "units": "metric",
        }
        resp = requests.get(CURRENT_URL, params=params, timeout=10)

        if resp.status_code != 200:
            error_data = resp.json()
            return jsonify({
                "success": False,
                "error": error_data.get("message", "Failed to fetch weather data."),
            }), resp.status_code

        data = resp.json()

        weather = {
            "city": data.get("name"),
            "country": data["sys"].get("country"),
            "coordinates": {
                "lat": data["coord"]["lat"],
                "lon": data["coord"]["lon"],
            },
            "temperature": {
                "current": data["main"]["temp"],
                "feels_like": data["main"]["feels_like"],
                "min": data["main"]["temp_min"],
                "max": data["main"]["temp_max"],
            },
            "humidity": data["main"]["humidity"],
            "pressure": data["main"]["pressure"],
            "wind": {
                "speed": data["wind"]["speed"],
                "deg": data["wind"].get("deg", 0),
            },
            "weather": {
                "main": data["weather"][0]["main"],
                "description": data["weather"][0]["description"],
                "icon": data["weather"][0]["icon"],
            },
            "visibility": data.get("visibility", 0),
            "clouds": data["clouds"]["all"],
        }

        _set_cached(cache_key, weather)
        return jsonify({"success": True, "weather": weather}), 200

    except requests.exceptions.Timeout:
        return jsonify({"success": False, "error": "Weather API request timed out."}), 504
    except requests.exceptions.ConnectionError:
        return jsonify({"success": False, "error": "Could not connect to weather service."}), 503
    except Exception as e:
        logger.exception("Weather fetch error")
        return jsonify({"success": False, "error": "Failed to fetch weather data. Please try again."}), 500


@weather_bp.route("/weather/forecast", methods=["GET"])
def get_forecast():
    """Fetch 5-day / 3-hour forecast for a city."""

    city = request.args.get("city")
    if not city:
        return jsonify({
            "success": False,
            "error": "Query parameter 'city' is required."
        }), 400

    # Check cache
    cache_key = f"forecast|{city.lower().strip()}"
    cached = _get_cached(cache_key)
    if cached is not None:
        return jsonify({"success": True, **cached, "cached": True}), 200

    try:
        params = {
            "q": city,
            "appid": OPENWEATHER_API_KEY,
            "units": "metric",
        }
        resp = requests.get(FORECAST_URL, params=params, timeout=10)

        if resp.status_code != 200:
            error_data = resp.json()
            return jsonify({
                "success": False,
                "error": error_data.get("message", "Failed to fetch forecast."),
            }), resp.status_code

        data = resp.json()

        forecasts = []
        for item in data.get("list", []):
            forecasts.append({
                "datetime": item["dt_txt"],
                "temperature": {
                    "current": item["main"]["temp"],
                    "feels_like": item["main"]["feels_like"],
                    "min": item["main"]["temp_min"],
                    "max": item["main"]["temp_max"],
                },
                "humidity": item["main"]["humidity"],
                "weather": {
                    "main": item["weather"][0]["main"],
                    "description": item["weather"][0]["description"],
                    "icon": item["weather"][0]["icon"],
                },
                "wind_speed": item["wind"]["speed"],
                "rain_3h": item.get("rain", {}).get("3h", 0),
            })

        result = {
            "city": data["city"]["name"],
            "country": data["city"]["country"],
            "forecast": forecasts,
        }

        _set_cached(cache_key, result)
        return jsonify({"success": True, **result}), 200

    except requests.exceptions.Timeout:
        return jsonify({"success": False, "error": "Forecast API timed out."}), 504
    except requests.exceptions.ConnectionError:
        return jsonify({"success": False, "error": "Could not connect to weather service."}), 503
    except Exception as e:
        logger.exception("Forecast fetch error")
        return jsonify({"success": False, "error": "Failed to fetch forecast data. Please try again."}), 500
