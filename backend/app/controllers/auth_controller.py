
from flask import request, jsonify

from app.validators.auth_validator import validate_register_data
from app.services.auth_service import register_user, login_user


def register():
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    user_data, errors = validate_register_data(data)

    if errors:
        return jsonify({
            "success": False,
            "message": "Validation failed",
            "errors": errors
        }), 400

    user, error = register_user(user_data)

    if error:
        return jsonify({
            "success": False,
            "message": error
        }), 409

    return jsonify({
        "success": True,
        "message": "User registered successfully",
        "user": user
    }), 201


def login():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "A JSON request body is required"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not isinstance(email, str) or not isinstance(password, str):
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    if not email.strip() or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400

    result, error = login_user(email, password)

    if error:
        return jsonify({
            "success": False,
            "message": error
        }), 401

    return jsonify({
        "success": True,
        "message": "Login successful",
        **result
    }), 200
