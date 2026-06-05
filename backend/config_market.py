"""
Mock Market Prices
===================
Fallback market price data used when the data.gov.in API is unavailable.
Split from config.py for maintainability.
"""

MOCK_MARKET_PRICES = {
    "rice": {"price": 2150, "unit": "per quintal", "trend": "up", "change": "+2.3%"},
    "wheat": {"price": 2275, "unit": "per quintal", "trend": "stable", "change": "+0.5%"},
    "maize": {"price": 1962, "unit": "per quintal", "trend": "down", "change": "-1.2%"},
    "cotton": {"price": 6620, "unit": "per quintal", "trend": "up", "change": "+3.1%"},
    "sugarcane": {"price": 315, "unit": "per quintal", "trend": "stable", "change": "+0.2%"},
    "jute": {"price": 5050, "unit": "per quintal", "trend": "down", "change": "-0.8%"},
    "coffee": {"price": 9800, "unit": "per quintal", "trend": "up", "change": "+4.5%"},
    "tea": {"price": 18500, "unit": "per quintal", "trend": "up", "change": "+1.7%"},
    "mango": {"price": 4500, "unit": "per quintal", "trend": "up", "change": "+5.2%"},
    "banana": {"price": 2800, "unit": "per quintal", "trend": "stable", "change": "+0.3%"},
    "apple": {"price": 7200, "unit": "per quintal", "trend": "up", "change": "+2.8%"},
    "grapes": {"price": 5500, "unit": "per quintal", "trend": "down", "change": "-1.5%"},
    "watermelon": {"price": 1500, "unit": "per quintal", "trend": "down", "change": "-3.0%"},
    "muskmelon": {"price": 2200, "unit": "per quintal", "trend": "stable", "change": "+0.1%"},
    "orange": {"price": 3800, "unit": "per quintal", "trend": "up", "change": "+1.9%"},
    "papaya": {"price": 2100, "unit": "per quintal", "trend": "stable", "change": "+0.4%"},
    "coconut": {"price": 2600, "unit": "per quintal", "trend": "up", "change": "+2.1%"},
    "pomegranate": {"price": 8500, "unit": "per quintal", "trend": "up", "change": "+3.7%"},
    "lentil": {"price": 6100, "unit": "per quintal", "trend": "stable", "change": "-0.3%"},
    "chickpea": {"price": 5200, "unit": "per quintal", "trend": "up", "change": "+1.4%"},
    "kidneybeans": {"price": 9500, "unit": "per quintal", "trend": "stable", "change": "+0.6%"},
    "pigeonpeas": {"price": 7100, "unit": "per quintal", "trend": "up", "change": "+2.5%"},
    "mothbeans": {"price": 6800, "unit": "per quintal", "trend": "down", "change": "-0.9%"},
    "mungbean": {"price": 7800, "unit": "per quintal", "trend": "up", "change": "+1.8%"},
    "blackgram": {"price": 6500, "unit": "per quintal", "trend": "stable", "change": "+0.7%"},
}
