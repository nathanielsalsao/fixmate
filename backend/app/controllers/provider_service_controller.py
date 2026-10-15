import math
import re
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from flask import g, jsonify, request

from app.database.mongodb import get_database
from app.domain.home_services import HomeService
from app.middleware.auth_middleware import role_required


def serialize_service(document):
    service = HomeService.from_document(document).to_dict()
    service["provider_id"] = (
        str(document["provider_id"])
        if document.get("provider_id")
        else None
    )
    service["is_active"] = document.get("is_active", True)

    for field in ("created_at", "updated_at"):
        value = document.get(field)
        service[field] = value.isoformat() if value else None

    return service


@role_required("provider")
def get_my_services():
    try:
        db = get_database()
        provider_id = ObjectId(g.user_id)

        documents = db.services.find(
            {"provider_id": provider_id}
        ).sort("created_at", -1)

        services = [serialize_service(doc) for doc in documents]

        return jsonify({
            "success": True,
            "count": len(services),
            "services": services
        }), 200

    except Exception:
        return jsonify({
            "success": False,
            "message": "Unable to retrieve your services"
        }), 500


@role_required("provider")
def create_provider_service():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "message": "A valid JSON object is required"
        }), 400

    name = data.get("name")
    category = data.get("category")
    description = data.get("description", "")
    base_price = data.get("base_price")

    if not isinstance(name, str) or not name.strip():
        return jsonify({"success": False, "message": "Service name is required"}), 400

    if not isinstance(category, str) or not category.strip():
        return jsonify({"success": False, "message": "Service category is required"}), 400

    if not isinstance(description, str):
        return jsonify({"success": False, "message": "Description must be text"}), 400

    if (
        isinstance(base_price, bool)
        or not isinstance(base_price, (int, float))
        or not math.isfinite(base_price)
        or base_price < 0
    ):
        return jsonify({
            "success": False,
            "message": "Base price must be a valid non-negative number"
        }), 400

    name = name.strip()
    category = category.strip()
    provider_id = ObjectId(g.user_id)
    now = datetime.now(timezone.utc)

    try:
        db = get_database()

        duplicate = db.services.find_one({
            "provider_id": provider_id,
            "name": {"$regex": f"^{re.escape(name)}$", "$options": "i"}
        })

        if duplicate:
            return jsonify({
                "success": False,
                "message": "You already have a service with this name"
            }), 409

        service = {
            "name": name,
            "category": category,
            "description": description.strip(),
            "base_price": float(base_price),
            "provider_id": provider_id,
            "is_active": True,
            "created_at": now,
            "updated_at": now
        }

        result = db.services.insert_one(service)
        service["_id"] = result.inserted_id

        return jsonify({
            "success": True,
            "message": "Your service was created successfully",
            "service": serialize_service(service)
        }), 201

    except Exception:
        return jsonify({
            "success": False,
            "message": "Unable to create your service"
        }), 500


@role_required("provider")
def update_provider_service(service_id):
    data = request.get_json(silent=True)

    if not isinstance(data, dict) or not data:
        return jsonify({
            "success": False,
            "message": "Provide at least one field to update"
        }), 400

    allowed_fields = {"name", "category", "description", "base_price"}

    if not set(data).issubset(allowed_fields):
        return jsonify({
            "success": False,
            "message": "One or more fields cannot be updated"
        }), 400

    try:
        object_id = ObjectId(service_id)
        provider_id = ObjectId(g.user_id)
    except (InvalidId, TypeError):
        return jsonify({
            "success": False,
            "message": "Invalid service ID"
        }), 400

    updates = {}

    for field in ("name", "category"):
        if field in data:
            value = data[field]
            if not isinstance(value, str) or not value.strip():
                return jsonify({
                    "success": False,
                    "message": f"{field} must be non-empty text"
                }), 400
            updates[field] = value.strip()

    if "description" in data:
        if not isinstance(data["description"], str):
            return jsonify({
                "success": False,
                "message": "Description must be text"
            }), 400
        updates["description"] = data["description"].strip()

    if "base_price" in data:
        price = data["base_price"]
        if (
            isinstance(price, bool)
            or not isinstance(price, (int, float))
            or not math.isfinite(price)
            or price < 0
        ):
            return jsonify({
                "success": False,
                "message": "Base price must be a valid non-negative number"
            }), 400
        updates["base_price"] = float(price)

    try:
        db = get_database()

        owned_service = db.services.find_one({
            "_id": object_id,
            "provider_id": provider_id,
            "is_active": True
        })

        if not owned_service:
            return jsonify({
                "success": False,
                "message": "Active service not found in your listings"
            }), 404

        if "name" in updates:
            duplicate = db.services.find_one({
                "_id": {"$ne": object_id},
                "provider_id": provider_id,
                "name": {
                    "$regex": f"^{re.escape(updates['name'])}$",
                    "$options": "i"
                }
            })
            if duplicate:
                return jsonify({
                    "success": False,
                    "message": "You already have a service with this name"
                }), 409

        updates["updated_at"] = datetime.now(timezone.utc)

        db.services.update_one(
            {
                "_id": object_id,
                "provider_id": provider_id,
                "is_active": True
            },
            {"$set": updates}
        )

        updated = db.services.find_one({"_id": object_id})

        return jsonify({
            "success": True,
            "message": "Your service was updated successfully",
            "service": serialize_service(updated)
        }), 200

    except Exception:
        return jsonify({
            "success": False,
            "message": "Unable to update your service"
        }), 500


@role_required("provider")
def deactivate_provider_service(service_id):
    try:
        object_id = ObjectId(service_id)
        provider_id = ObjectId(g.user_id)
    except (InvalidId, TypeError):
        return jsonify({
            "success": False,
            "message": "Invalid service ID"
        }), 400

    try:
        db = get_database()

        result = db.services.update_one(
            {
                "_id": object_id,
                "provider_id": provider_id,
                "is_active": True
            },
            {
                "$set": {
                    "is_active": False,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )

        if result.matched_count == 0:
            return jsonify({
                "success": False,
                "message": "Active service not found in your listings"
            }), 404

        return jsonify({
            "success": True,
            "message": "Your service was deactivated successfully"
        }), 200

    except Exception:
        return jsonify({
            "success": False,
            "message": "Unable to deactivate your service"
        }), 500
