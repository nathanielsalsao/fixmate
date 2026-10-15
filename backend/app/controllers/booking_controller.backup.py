from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from flask import jsonify, request, g

from app.database.mongodb import get_database
from app.middleware.auth_middleware import role_required


@role_required("customer")
def create_booking():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "A valid JSON object is required"
        }), 400

    service_id = data.get("service_id")
    booking_date = data.get("booking_date")
    address = data.get("address")
    notes = data.get("notes", "")

    if not isinstance(service_id, str):
        return jsonify({
            "success": False,
            "message": "Service ID is required"
        }), 400

    if not isinstance(booking_date, str) or not booking_date.strip():
        return jsonify({
            "success": False,
            "message": "Booking date is required"
        }), 400

    if not isinstance(address, str) or not address.strip():
        return jsonify({
            "success": False,
            "message": "Service address is required"
        }), 400

    if not isinstance(notes, str):
        return jsonify({
            "success": False,
            "message": "Notes must be text"
        }), 400

    try:
        parsed_date = datetime.fromisoformat(
            booking_date.strip().replace("Z", "+00:00")
        )
    except ValueError:
        return jsonify({
            "success": False,
            "message": "Booking date must be a valid ISO date/time"
        }), 400

    if parsed_date.tzinfo is None:
        return jsonify({
            "success": False,
            "message": "Booking date must include a timezone"
        }), 400

    if parsed_date <= datetime.now(timezone.utc):
        return jsonify({
            "success": False,
            "message": "Booking date must be in the future"
        }), 400

    try:
        service_object_id = ObjectId(service_id)
    except (InvalidId, TypeError):
        return jsonify({
            "success": False,
            "message": "Invalid service ID"
        }), 400

    try:
        db = get_database()

        service = db.services.find_one({
            "_id": service_object_id,
            "is_active": True
        })

        if not service:
            return jsonify({
                "success": False,
                "message": "Active service not found"
            }), 404

        now = datetime.now(timezone.utc)

        booking = {
            "customer_id": ObjectId(g.user_id),
            "service_id": service["_id"],
            "service_name": service["name"],
            "category": service["category"],
            "base_price": float(service["base_price"]),
            "booking_date": parsed_date.astimezone(timezone.utc),
            "address": address.strip(),
            "notes": notes.strip(),
            "status": "pending",
            "provider_id": None,
            "created_at": now,
            "updated_at": now
        }

        result = db.bookings.insert_one(booking)

        return jsonify({
            "success": True,
            "message": "Booking created successfully",
            "booking": {
                "id": str(result.inserted_id),
                "service_id": str(service["_id"]),
                "service_name": service["name"],
                "base_price": float(service["base_price"]),
                "booking_date": booking["booking_date"].isoformat(),
                "address": booking["address"],
                "notes": booking["notes"],
                "status": booking["status"]
            }
        }), 201

    except Exception:
        return jsonify({
            "success": False,
            "message": "Unable to create booking"
        }), 500


@role_required("customer", "provider", "admin")
def get_bookings():
    return jsonify({
        "success": False,
        "message": "Not implemented yet"
    }), 501


@role_required("customer", "provider", "admin")
def get_booking(booking_id):
    return jsonify({
        "success": False,
        "message": "Not implemented yet"
    }), 501


@role_required("provider", "admin")
def update_booking_status(booking_id):
    return jsonify({
        "success": False,
        "message": "Not implemented yet"
    }), 501
