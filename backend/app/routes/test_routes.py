
from flask import Blueprint, jsonify, g

from app.utils.auth_decorators import token_required, role_required

test_bp = Blueprint("test", __name__, url_prefix="/api/test")


@test_bp.route("/protected", methods=["GET"])
@token_required
def protected():
    return jsonify({
        "success": True,
        "message": "Authentication successful",
        "user": g.current_user
    }), 200


@test_bp.route("/admin", methods=["GET"])
@role_required("admin")
def admin_only():
    return jsonify({
        "success": True,
        "message": "Admin access granted"
    }), 200
