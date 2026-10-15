from flask import Blueprint

from app.controllers.service_controller import (
    get_services,
    create_service,
    update_service,
    deactivate_service,
)
from app.controllers.provider_service_controller import (
    get_my_services,
    create_provider_service,
    update_provider_service,
    deactivate_provider_service,
)

services_bp = Blueprint(
    "services",
    __name__,
    url_prefix="/api/services"
)

# Public service catalogue
services_bp.route("", methods=["GET"])(get_services)

# Admin service management
services_bp.route("", methods=["POST"])(create_service)
services_bp.route("/<service_id>", methods=["PUT"])(update_service)
services_bp.route("/<service_id>", methods=["DELETE"])(deactivate_service)

# Provider-owned service management
services_bp.route("/my", methods=["GET"])(get_my_services)
services_bp.route("/provider", methods=["POST"])(create_provider_service)
services_bp.route(
    "/provider/<service_id>", methods=["PUT"]
)(update_provider_service)
services_bp.route(
    "/provider/<service_id>", methods=["DELETE"]
)(deactivate_provider_service)
