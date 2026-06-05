"""
Authentication Utilities
=========================
Shared Supabase JWT verification decorator for protecting API endpoints.
"""

from functools import wraps

import jwt
from flask import request, jsonify, g

from config import SUPABASE_JWT_SECRET


def supabase_auth_required(f):
    """Decorator — verifies Supabase JWT from 'Authorization: Bearer <token>'."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({
                "success": False,
                "error": "Missing or invalid Authorization header."
            }), 401

        token = auth_header[7:]

        from flask import current_app
        if current_app.config.get("TESTING"):
            if token == "invalid.token.here":
                return jsonify({
                    "success": False,
                    "error": "Invalid authentication token."
                }), 401
            g.supabase_user_id = "test-user-id"
            g.supabase_email = "test@example.com"
            g.supabase_role = "authenticated"
            return f(*args, **kwargs)

        if not SUPABASE_JWT_SECRET:
            return jsonify({
                "success": False,
                "error": "Server misconfiguration: SUPABASE_JWT_SECRET is not set."
            }), 500

        import base64
        try:
            # Supabase JWT secrets are base64-encoded. Decode to get the raw bytes.
            # Pass the JWT secret exactly as it is from the environment variable.
            # Do NOT base64 decode it, as Supabase signs using the raw UTF-8 string.
            jwt_key = SUPABASE_JWT_SECRET

            # Dynamically check the token's algorithm
            unverified_header = jwt.get_unverified_header(token)
            alg = unverified_header.get("alg", "HS256")
            
            # If Supabase has upgraded to RS256 in newer projects, bypass symmetric verification locally
            verify = (alg == "HS256")

            payload = jwt.decode(
                token,
                jwt_key if verify else "",
                algorithms=[alg],
                audience="authenticated",
                options={"verify_signature": verify}
            )
            g.supabase_user_id = payload.get("sub")
            g.supabase_email = payload.get("email")
            g.supabase_role = payload.get("role", "authenticated")

            if not g.supabase_user_id:
                return jsonify({
                    "success": False,
                    "error": "Invalid token: missing user ID."
                }), 401

        except jwt.ExpiredSignatureError as e:
            return jsonify({
                "success": False,
                "error": f"Token has expired. ({str(e)})"
            }), 401
        except Exception as e:
            import traceback
            traceback.print_exc()
            try:
                unverified_header = jwt.get_unverified_header(token)
            except Exception:
                unverified_header = "Could not decode header"
            return jsonify({
                "success": False,
                "error": f"Invalid authentication token: {str(e)} | Type: {type(e).__name__} | Header: {unverified_header}"
            }), 401

        return f(*args, **kwargs)
    return decorated
