"""
/user  —  User Profile Endpoints (Supabase JWT Auth)
======================================================
GET    /user/profile     → Get logged-in user profile  (Supabase token required)

Authentication is handled client-side by Supabase Auth.
The backend validates the Supabase JWT and extracts the user ID.
Profile data is managed client-side via Supabase's `profiles` table.
"""

import logging

from flask import Blueprint, jsonify, g

from utils.auth import supabase_auth_required

logger = logging.getLogger(__name__)

user_bp = Blueprint("user", __name__)


# ── Routes ─────────────────────────────────────────────────────────────────────

@user_bp.route("/user/profile", methods=["GET"])
@supabase_auth_required
def get_profile():
    """Return the authenticated user's basic identity from the JWT."""
    return jsonify({
        "success": True,
        "user": {
            "id": g.supabase_user_id,
            "email": g.supabase_email,
            "role": g.supabase_role,
        }
    }), 200

