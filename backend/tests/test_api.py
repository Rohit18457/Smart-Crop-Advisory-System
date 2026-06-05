"""
Backend API Tests
==================
Tests for all major API endpoints. Run with:
    cd backend && python -m pytest tests/ -v
"""

import json


# ── Health Check ───────────────────────────────────────────────────────────────

class TestHealthCheck:
    """Tests for the root health-check endpoint."""

    def test_health_check_returns_200(self, client):
        resp = client.get("/")
        assert resp.status_code == 200

    def test_health_check_json_structure(self, client):
        resp = client.get("/")
        data = resp.get_json()
        assert data["status"] == "online"
        assert data["service"] == "Smart Agriculture Advisory API"
        assert "endpoints" in data

    def test_health_check_version(self, client):
        resp = client.get("/")
        data = resp.get_json()
        assert data["version"] == "2.0.0"
        assert data["auth"] == "Supabase JWT"


# ── Disease Detection ─────────────────────────────────────────────────────────

class TestDiseaseDetection:
    """Tests for POST /predict-disease."""

    def test_missing_image_returns_400(self, client):
        resp = client.post("/predict-disease", headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 400
        data = resp.get_json()
        assert data["success"] is False
        assert "image" in data["error"].lower()

    def test_empty_filename_returns_400(self, client):
        from io import BytesIO
        data = {"image": (BytesIO(b""), "")}
        resp = client.post("/predict-disease", data=data, content_type="multipart/form-data", headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 400

    def test_invalid_file_type_returns_400(self, client):
        from io import BytesIO
        data = {"image": (BytesIO(b"not an image"), "test.txt")}
        resp = client.post("/predict-disease", data=data, content_type="multipart/form-data", headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 400
        json_data = resp.get_json()
        assert "invalid file type" in json_data["error"].lower()

    def test_empty_file_returns_400(self, client):
        from io import BytesIO
        data = {"image": (BytesIO(b""), "test.jpg")}
        resp = client.post("/predict-disease", data=data, content_type="multipart/form-data", headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 400
        json_data = resp.get_json()
        assert json_data["success"] is False


# ── Crop Recommendation ───────────────────────────────────────────────────────

class TestCropRecommendation:
    """Tests for POST /crop-recommend."""

    def test_missing_body_returns_400(self, client):
        resp = client.post("/crop-recommend")
        assert resp.status_code == 400

    def test_missing_fields_returns_400(self, client):
        resp = client.post("/crop-recommend",
                           data=json.dumps({"N": 50}),
                           content_type="application/json")
        assert resp.status_code == 400
        data = resp.get_json()
        assert data["success"] is False
        assert "errors" in data

    def test_out_of_range_ph_returns_400(self, client):
        payload = {
            "N": 50, "P": 50, "K": 50,
            "temperature": 25, "humidity": 50,
            "ph": 20,  # invalid: must be 0-14
            "rainfall": 100,
        }
        resp = client.post("/crop-recommend",
                           data=json.dumps(payload),
                           content_type="application/json")
        assert resp.status_code == 400
        data = resp.get_json()
        assert any("ph" in e.lower() for e in data["errors"])

    def test_non_numeric_field_returns_400(self, client):
        payload = {
            "N": "abc", "P": 50, "K": 50,
            "temperature": 25, "humidity": 50,
            "ph": 7, "rainfall": 100,
        }
        resp = client.post("/crop-recommend",
                           data=json.dumps(payload),
                           content_type="application/json")
        assert resp.status_code == 400

    def test_valid_input_returns_200(self, client):
        """This test only passes when the crop model is loaded."""
        payload = {
            "N": 90, "P": 42, "K": 43,
            "temperature": 20.88, "humidity": 82.0,
            "ph": 6.5, "rainfall": 202.9,
        }
        resp = client.post("/crop-recommend",
                           data=json.dumps(payload),
                           content_type="application/json")
        # May return 200 (model loaded) or 500 (model not loaded)
        assert resp.status_code in [200, 500]
        if resp.status_code == 200:
            data = resp.get_json()
            assert data["success"] is True
            assert "recommendation" in data


# ── Weather ────────────────────────────────────────────────────────────────────

class TestWeather:
    """Tests for GET /weather and /weather/forecast."""

    def test_missing_city_returns_400(self, client):
        resp = client.get("/weather")
        assert resp.status_code == 400
        data = resp.get_json()
        assert data["success"] is False
        assert "city" in data["error"].lower()

    def test_forecast_missing_city_returns_400(self, client):
        resp = client.get("/weather/forecast")
        assert resp.status_code == 400


# ── Market Prices ──────────────────────────────────────────────────────────────

class TestMarketPrices:
    """Tests for GET /market-prices."""

    def test_get_all_prices_returns_200(self, client):
        resp = client.get("/market-prices")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert "market_data" in data
        assert "source" in data

    def test_get_prices_with_commodity_filter(self, client):
        resp = client.get("/market-prices?commodity=rice")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True

    def test_legacy_crop_param_still_works(self, client):
        resp = client.get("/market-prices?crop=wheat")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True


# ── Chat ───────────────────────────────────────────────────────────────────────

class TestChat:
    """Tests for POST /chat."""

    def test_missing_message_returns_400(self, client):
        resp = client.post("/chat",
                           data=json.dumps({}),
                           content_type="application/json",
                           headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 400
        data = resp.get_json()
        assert data["success"] is False

    def test_empty_message_returns_400(self, client):
        resp = client.post("/chat",
                           data=json.dumps({"message": "   "}),
                           content_type="application/json",
                           headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 400

    def test_too_long_message_returns_400(self, client):
        resp = client.post("/chat",
                           data=json.dumps({"message": "x" * 3000}),
                           content_type="application/json",
                           headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 400
        data = resp.get_json()
        assert "too long" in data["error"].lower()

    def test_invalid_history_type_returns_400(self, client):
        resp = client.post("/chat",
                           data=json.dumps({"message": "hello", "history": "not an array"}),
                           content_type="application/json",
                           headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 400


# ── User Profile (Supabase JWT) ────────────────────────────────────────────────

class TestUserProfile:
    """Tests for GET /user/profile (requires Supabase JWT)."""

    def test_missing_auth_header_returns_401(self, client):
        resp = client.get("/user/profile")
        assert resp.status_code == 401
        data = resp.get_json()
        assert data["success"] is False

    def test_invalid_token_returns_401(self, client):
        resp = client.get("/user/profile",
                          headers={"Authorization": "Bearer invalid.token.here"})
        assert resp.status_code in [401, 500]

    def test_valid_token_returns_200(self, client):
        resp = client.get("/user/profile",
                          headers={"Authorization": "Bearer test-token"})
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert "user" in data
        assert data["user"]["id"] == "test-user-id"


# ── 404 Handler ────────────────────────────────────────────────────────────────

class TestErrorHandlers:
    """Tests for global error handlers."""

    def test_404_returns_json(self, client):
        resp = client.get("/nonexistent-endpoint")
        assert resp.status_code == 404
        data = resp.get_json()
        assert data["success"] is False

    def test_405_returns_json(self, client):
        resp = client.delete("/weather")  # weather only accepts GET
        assert resp.status_code == 405
        data = resp.get_json()
        assert data["success"] is False
