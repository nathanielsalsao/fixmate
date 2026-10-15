from flask import Blueprint

from app.controllers.admin_dashboard_controller import get_admin_dashboard


admin_dashboard_bp = Blueprint(
    "admin_dashboard",
    __name__,
    url_prefix="/api/admin"
)

admin_dashboard_bp.route(
    "/dashboard",
    methods=["GET"]
)(get_admin_dashboard)