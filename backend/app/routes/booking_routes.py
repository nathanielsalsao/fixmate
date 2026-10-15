from flask import Blueprint

from app.controllers.booking_controller import (
    create_booking,
    get_bookings,
    get_booking,
    update_booking_status,
    cancel_booking,
)

bookings_bp = Blueprint(
    "bookings",
    __name__,
    url_prefix="/api/bookings"
)

bookings_bp.route("", methods=["POST"])(create_booking)
bookings_bp.route("", methods=["GET"])(get_bookings)
bookings_bp.route("/<booking_id>", methods=["GET"])(get_booking)
bookings_bp.route("/<booking_id>/status", methods=["PATCH"])(update_booking_status)

from app.controllers.booking_controller import assign_provider
bookings_bp.route("/<booking_id>/assign", methods=["PATCH"])(assign_provider)

bookings_bp.route("/<booking_id>/cancel", methods=["PATCH"])(cancel_booking)


