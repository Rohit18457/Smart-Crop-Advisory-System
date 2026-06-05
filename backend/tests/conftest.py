"""
Pytest fixtures for Smart Agriculture API tests.
"""

import sys
import os

# Add the backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from app import create_app


@pytest.fixture
def app():
    """Create a Flask app configured for testing."""
    app = create_app()
    app.config["TESTING"] = True
    return app


@pytest.fixture
def client(app):
    """A Flask test client."""
    return app.test_client()
