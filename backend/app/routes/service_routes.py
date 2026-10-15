from flask import Blueprint

from app.controllers.service_controller import (
    get_services,
    create_service,
    update_service,
    deactivate_service,
)


services_bp = Blueprint(
    "services",
    __name__,
    url_prefix="/api/services"
)

services_bp.route("", methods=["GET"])(get_services)
services_bp.route("", methods=["POST"])(create_service)
services_bp.route("/<service_id>", methods=["PUT"])(update_service)
services_bp.route("/<service_id>", methods=["DELETE"])(deactivate_service)
