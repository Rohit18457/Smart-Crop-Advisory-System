"""
/market-prices  —  Crop Market Prices Endpoint
================================================
GET  /market-prices                   → returns live crop prices from data.gov.in
GET  /market-prices?commodity=rice    → filter by commodity name
GET  /market-prices?state=Maharashtra → filter by state

Falls back to mock data from config.py if the live API is unavailable.
Uses in-memory caching with a 5-minute TTL to avoid hammering the API.
"""

import time
import logging

import os
import json
import redis
import requests
from flask import Blueprint, request, jsonify
from config import CROP_PRICE_API_KEY, MOCK_MARKET_PRICES

logger = logging.getLogger(__name__)

market_bp = Blueprint("market", __name__)

# ── data.gov.in API config ─────────────────────────────────────────────────────
_DATA_GOV_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
_CACHE_TTL_SECONDS = 300  # 5 minutes

redis_url = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0")
try:
    redis_client = redis.from_url(redis_url)
except Exception as e:
    logger.warning(f"Could not connect to Redis for market cache: {e}")
    redis_client = None

def _fetch_live_prices(commodity_filter="", state_filter="", limit=100):
    """
    Fetch live mandi prices from data.gov.in.

    Returns (list[dict], bool) — (price records, is_live).
    If the API fails, returns (mock_data, False).
    """
    # Check cache first
    cache_key = f"market|{commodity_filter}|{state_filter}|{limit}"

    if redis_client:
        try:
            cached_data = redis_client.get(cache_key)
            if cached_data:
                return json.loads(cached_data), True
        except Exception as e:
            logger.warning(f"Redis get error: {e}")

    # If no API key, use mock data
    if not CROP_PRICE_API_KEY:
        return _build_mock_response(), False

    try:
        params = {
            "api-key": CROP_PRICE_API_KEY,
            "format": "json",
            "limit": limit,
            "offset": 0,
        }
        if commodity_filter:
            params["filters[commodity]"] = commodity_filter.title()
        if state_filter:
            params["filters[state]"] = state_filter.title()

        resp = requests.get(_DATA_GOV_URL, params=params, timeout=10)

        if resp.status_code != 200:
            logger.warning("data.gov.in API returned %s", resp.status_code)
            return _build_mock_response(), False

        data = resp.json()
        records = data.get("records", [])

        if not records:
            # API returned empty — might be a filter mismatch or no data today
            if commodity_filter or state_filter:
                return [], True
            return _build_mock_response(), False

        # Parse records into a clean format
        parsed = []
        for rec in records:
            try:
                min_price = float(rec.get("min_price", 0))
                max_price = float(rec.get("max_price", 0))
                modal_price = float(rec.get("modal_price", 0))

                parsed.append({
                    "commodity": rec.get("commodity", "Unknown"),
                    "state": rec.get("state", ""),
                    "district": rec.get("district", ""),
                    "market": rec.get("market", ""),
                    "variety": rec.get("variety", ""),
                    "min_price": min_price,
                    "max_price": max_price,
                    "modal_price": modal_price,
                    "unit": "per quintal",
                    "arrival_date": rec.get("arrival_date", ""),
                })
            except (ValueError, TypeError):
                continue

        # Update cache
        if redis_client:
            try:
                redis_client.setex(cache_key, _CACHE_TTL_SECONDS, json.dumps(parsed))
            except Exception as e:
                logger.warning(f"Redis set error: {e}")

        return parsed, True

    except requests.exceptions.Timeout:
        logger.warning("data.gov.in API timed out")
        return _build_mock_response(), False
    except requests.exceptions.ConnectionError:
        logger.warning("Could not connect to data.gov.in")
        return _build_mock_response(), False
    except Exception as e:
        logger.exception("data.gov.in API error")
        return _build_mock_response(), False


def _build_mock_response():
    """Convert MOCK_MARKET_PRICES config into the same list format."""
    result = []
    for name, data in sorted(MOCK_MARKET_PRICES.items()):
        result.append({
            "commodity": name.title(),
            "state": "",
            "district": "",
            "market": "",
            "variety": "",
            "min_price": data["price"] * 0.95,
            "max_price": data["price"] * 1.05,
            "modal_price": data["price"],
            "unit": data["unit"],
            "arrival_date": "",
            "trend": data.get("trend", "stable"),
            "change": data.get("change", "0%"),
        })
    return result


@market_bp.route("/market-prices", methods=["GET"])
def get_market_prices():
    """Return market prices — optionally filtered by commodity or state."""

    commodity = request.args.get("commodity", "").strip()
    state = request.args.get("state", "").strip()
    # Support legacy 'crop' param
    if not commodity:
        commodity = request.args.get("crop", "").strip()

    limit = request.args.get("limit", "100")
    try:
        limit = min(int(limit), 500)
    except ValueError:
        limit = 100

    prices, is_live = _fetch_live_prices(commodity, state, limit)

    return jsonify({
        "success": True,
        "source": "data.gov.in" if is_live else "cached/mock",
        "total_records": len(prices),
        "market_data": prices,
    }), 200
