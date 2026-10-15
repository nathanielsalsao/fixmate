
from flask import Blueprint, jsonify, g
from app.middleware.auth_middleware import role_required

role_test_bp = Blueprint("role_test", __name__, url_prefix="/api/test")


@role_test_bp.route("/customer", methods=["GET"])
@role_required("customer")
def customer_test():
    return jsonify({
        "success": True,
        "message": "Customer access granted",
        "user_id": g.user_id,
        "role": g.user_role
    })


@role_test_bp.route("/provider", methods=["GET"])
@role_required("provider")
def provider_test():
    return jsonify({
        "success": True,
        "message": "Provider access granted",
        "user_id": g.user_id,
        "role": g.user_role
    })


@role_test_bp.route("/admin", methods=["GET"])
@role_required("admin")
def admin_test():
    return jsonify({
        "success": True,
        "message": "Admin access granted",
        "user_id": g.user_id,
        "role": g.user_role
    })
