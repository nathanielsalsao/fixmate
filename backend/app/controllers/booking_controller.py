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
            "provider_id": service.get("provider_id"),
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
    try:
        db = get_database()

        # Apply access restrictions according to the logged-in user's role.
        if g.user_role == "customer":
            query = {
                "customer_id": ObjectId(g.user_id)
            }
        elif g.user_role == "provider":
            query = {
                "provider_id": ObjectId(g.user_id)
            }
        else:
            # Admins can view every booking.
            query = {}

        documents = list(
            db.bookings.find(query).sort("created_at", -1)
        )

        bookings = []

        for document in documents:
            bookings.append({
                "id": str(document["_id"]),
                "customer_id": str(document["customer_id"]),
                "provider_id": (
                    str(document["provider_id"])
                    if document.get("provider_id")
                    else None
                ),
                "service_id": str(document["service_id"]),
                "service_name": document.get("service_name", ""),
                "category": document.get("category", ""),
                "base_price": float(document.get("base_price", 0)),
                "booking_date": (
                    document["booking_date"].isoformat()
                    if document.get("booking_date")
                    else None
                ),
                "address": document.get("address", ""),
                "notes": document.get("notes", ""),
                "status": document.get("status", "pending"),
                "created_at": (
                    document["created_at"].isoformat()
                    if document.get("created_at")
                    else None
                ),
                "updated_at": (
                    document["updated_at"].isoformat()
                    if document.get("updated_at")
                    else None
                )
            })

        return jsonify({
            "success": True,
            "count": len(bookings),
            "bookings": bookings
        }), 200

    except Exception:
        return jsonify({
            "success": False,
            "message": "Unable to retrieve bookings"
        }), 500

@role_required("customer", "provider", "admin")
def get_booking(booking_id):
    try:
        booking_object_id = ObjectId(booking_id)
    except (InvalidId, TypeError):
        return jsonify({
            "success": False,
            "message": "Invalid booking ID"
        }), 400

    try:
        db = get_database()

        query = {"_id": booking_object_id}

        if g.user_role == "customer":
            query["customer_id"] = ObjectId(g.user_id)
        elif g.user_role == "provider":
            query["provider_id"] = ObjectId(g.user_id)

        document = db.bookings.find_one(query)

        if not document:
            return jsonify({
                "success": False,
                "message": "Booking not found"
            }), 404

        booking = {
            "id": str(document["_id"]),
            "customer_id": str(document["customer_id"]),
            "provider_id": (
                str(document["provider_id"])
                if document.get("provider_id")
                else None
            ),
            "service_id": str(document["service_id"]),
            "service_name": document.get("service_name", ""),
            "category": document.get("category", ""),
            "base_price": float(document.get("base_price", 0)),
            "booking_date": (
                document["booking_date"].isoformat()
                if document.get("booking_date")
                else None
            ),
            "address": document.get("address", ""),
            "notes": document.get("notes", ""),
            "status": document.get("status", "pending"),
            "created_at": (
                document["created_at"].isoformat()
                if document.get("created_at")
                else None
            ),
            "updated_at": (
                document["updated_at"].isoformat()
                if document.get("updated_at")
                else None
            )
        }

        return jsonify({
            "success": True,
            "booking": booking
        }), 200

    except Exception:
        return jsonify({
            "success": False,
            "message": "Unable to retrieve booking"
        }), 500

@role_required("provider", "admin")
def update_booking_status(booking_id):
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "A valid JSON object is required"
        }), 400

    status = data.get("status")

    if not isinstance(status, str):
        return jsonify({
            "success": False,
            "message": "Status is required"
        }), 400

    status = status.strip().lower()

    transitions = {
        "pending": {"confirmed", "cancelled"},
        "confirmed": {"in_progress", "cancelled"},
        "in_progress": {"completed"},
        "completed": set(),
        "cancelled": set(),
    }

    if status not in transitions:
        return jsonify({
            "success": False,
            "message": "Invalid booking status"
        }), 400

    try:
        booking_object_id = ObjectId(booking_id)
    except (InvalidId, TypeError):
        return jsonify({
            "success": False,
            "message": "Invalid booking ID"
        }), 400

    try:
        db = get_database()

        query = {"_id": booking_object_id}

        if g.user_role == "provider":
            query["provider_id"] = ObjectId(g.user_id)

        document = db.bookings.find_one(query)

        if not document:
            return jsonify({
                "success": False,
                "message": "Booking not found or not assigned to this provider"
            }), 404

        current_status = document.get("status", "pending")

        if status not in transitions.get(current_status, set()):
            return jsonify({
                "success": False,
                "message": (
                    f"Cannot change booking status from "
                    f"{current_status} to {status}"
                )
            }), 400

        now = datetime.now(timezone.utc)

        result = db.bookings.update_one(
            {
                "_id": booking_object_id,
                "status": current_status
            },
            {
                "$set": {
                    "status": status,
                    "updated_at": now
                }
            }
        )

        if result.modified_count != 1:
            return jsonify({
                "success": False,
                "message": "Booking changed before the update could be saved"
            }), 409

        return jsonify({
            "success": True,
            "message": "Booking status updated successfully",
            "booking": {
                "id": str(booking_object_id),
                "previous_status": current_status,
                "status": status,
                "updated_at": now.isoformat()
            }
        }), 200

    except Exception:
        return jsonify({
            "success": False,
            "message": "Unable to update booking status"
        }), 500

@role_required("admin")
def assign_provider(booking_id):
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "A valid JSON object is required"
        }), 400

    provider_id = data.get("provider_id")

    if not isinstance(provider_id, str) or not provider_id.strip():
        return jsonify({
            "success": False,
            "message": "Provider ID is required"
        }), 400

    try:
        booking_object_id = ObjectId(booking_id)
        provider_object_id = ObjectId(provider_id.strip())
    except (InvalidId, TypeError):
        return jsonify({
            "success": False,
            "message": "Invalid booking ID or provider ID"
        }), 400

    try:
        db = get_database()

        provider = db.users.find_one({
            "_id": provider_object_id,
            "role": "provider"
        })

        if not provider:
            return jsonify({
                "success": False,
                "message": "Provider account not found"
            }), 404

        booking = db.bookings.find_one({
            "_id": booking_object_id
        })

        if not booking:
            return jsonify({
                "success": False,
                "message": "Booking not found"
            }), 404

        if booking.get("status") != "pending":
            return jsonify({
                "success": False,
                "message": "Only pending bookings can be assigned"
            }), 409

        if booking.get("provider_id") is not None:
            return jsonify({
                "success": False,
                "message": "A provider is already assigned to this booking"
            }), 409

        now = datetime.now(timezone.utc)

        result = db.bookings.update_one(
            {
                "_id": booking_object_id,
                "status": "pending",
                "provider_id": None
            },
            {
                "$set": {
                    "provider_id": provider_object_id,
                    "updated_at": now
                }
            }
        )

        if result.modified_count != 1:
            return jsonify({
                "success": False,
                "message": "Booking changed before assignment could be completed"
            }), 409

        return jsonify({
            "success": True,
            "message": "Provider assigned successfully",
            "booking": {
                "id": str(booking_object_id),
                "provider_id": str(provider_object_id),
                "provider_name": provider.get("name", ""),
                "status": "pending",
                "updated_at": now.isoformat()
            }
        }), 200

    except Exception:
        return jsonify({
            "success": False,
            "message": "Unable to assign provider"
        }), 500


@role_required("customer")
def cancel_booking(booking_id):
    try:
        booking_object_id = ObjectId(booking_id)
    except (InvalidId, TypeError):
        return jsonify({
            "success": False,
            "message": "Invalid booking ID"
        }), 400

    try:
        db = get_database()

        query = {
            "_id": booking_object_id,
            "customer_id": ObjectId(g.user_id)
        }

        booking = db.bookings.find_one(query)

        if not booking:
            return jsonify({
                "success": False,
                "message": "Booking not found"
            }), 404

        current_status = booking.get("status", "pending")

        if current_status not in {"pending", "confirmed"}:
            return jsonify({
                "success": False,
                "message": (
                    f"Booking cannot be cancelled when its status "
                    f"is {current_status}"
                )
            }), 409

        now = datetime.now(timezone.utc)

        result = db.bookings.update_one(
            {
                "_id": booking_object_id,
                "customer_id": ObjectId(g.user_id),
                "status": current_status
            },
            {
                "$set": {
                    "status": "cancelled",
                    "updated_at": now
                }
            }
        )

        if result.modified_count != 1:
            return jsonify({
                "success": False,
                "message": "Booking changed before cancellation could be completed"
            }), 409

        return jsonify({
            "success": True,
            "message": "Booking cancelled successfully",
            "booking": {
                "id": str(booking_object_id),
                "previous_status": current_status,
                "status": "cancelled",
                "updated_at": now.isoformat()
            }
        }), 200

    except Exception:
        return jsonify({
            "success": False,
            "message": "Unable to cancel booking"
        }), 500

