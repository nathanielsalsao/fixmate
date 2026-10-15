
import os
from functools import wraps

import jwt
from flask import request, jsonify, g
from dotenv import load_dotenv

load_dotenv()


def token_required(view_function):
    @wraps(view_function)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        parts = auth_header.split()

        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({
                "success": False,
                "message": "Authentication token is required"
            }), 401

        token = parts[1]
        secret = os.getenv("JWT_SECRET")

        if not secret:
            return jsonify({
                "success": False,
                "message": "Server authentication configuration error"
            }), 500

        try:
            payload = jwt.decode(
                token,
                secret,
                algorithms=["HS256"]
            )

            if not payload.get("sub") or not payload.get("role"):
                return jsonify({
                    "success": False,
                    "message": "Invalid token claims"
                }), 401

            g.current_user = {
                "id": payload["sub"],
                "role": payload["role"]
            }

        except jwt.ExpiredSignatureError:
            return jsonify({
                "success": False,
                "message": "Token has expired"
            }), 401

        except jwt.InvalidTokenError:
            return jsonify({
                "success": False,
                "message": "Invalid token"
            }), 401

        return view_function(*args, **kwargs)

    return decorated


def role_required(*allowed_roles):
    def decorator(view_function):
        @wraps(view_function)
        @token_required
        def decorated(*args, **kwargs):
            if g.current_user["role"] not in allowed_roles:
                return jsonify({
                    "success": False,
                    "message": "You do not have permission to access this resource"
                }), 403

            return view_function(*args, **kwargs)

        return decorated

    return decorator
