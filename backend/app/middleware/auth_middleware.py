
import os
from functools import wraps

import jwt
from flask import request, jsonify, g
from dotenv import load_dotenv

load_dotenv()


def token_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({
                "success": False,
                "message": "Authentication token is required"
            }), 401

        token = auth_header.split(" ", 1)[1].strip()
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

            g.user_id = payload["sub"]
            g.user_role = payload["role"]

        except (jwt.InvalidTokenError, KeyError):
            return jsonify({
                "success": False,
                "message": "Invalid or expired token"
            }), 401

        return func(*args, **kwargs)

    return wrapper


def role_required(*allowed_roles):
    def decorator(func):
        @wraps(func)
        @token_required
        def wrapper(*args, **kwargs):
            if g.user_role not in allowed_roles:
                return jsonify({
                    "success": False,
                    "message": "You do not have permission to access this resource"
                }), 403

            return func(*args, **kwargs)

        return wrapper

    return decorator
