import re
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from flask import jsonify, request

from app.database.mongodb import get_database
from app.domain.home_services import HomeService
from app.middleware.auth_middleware import role_required


def get_services():
    """Return active MongoDB services using OOP objects."""
    try:
        db = get_database()
        documents = db.services.find(
            {"is_active": True}
        ).sort("name", 1)

        services = []

        for document in documents:
            service_object = HomeService.from_document(document)
            service_data = service_object.to_dict()
            service_data["is_active"] = document.get("is_active", True)
            service_data["provider_id"] = (
                str(document["provider_id"])
                if document.get("provider_id")
                else None
            )
            services.append(service_data)

        return jsonify({
            "success": True,
            "count": len(services),
            "services": services
        }), 200

    except ValueError:
        return jsonify({
            "success": False,
            "message": "A service record contains invalid data"
        }), 400

    except Exception:
        return jsonify({
            "success": False,
            "message": "Unable to retrieve services"
        }), 500


@role_required("admin")
def create_service():
    """Create a service. Admin access only."""
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
        return jsonify({
            "success": False,
            "message": "Service name is required"
        }), 400

    if not isinstance(category, str) or not category.strip():
        return jsonify({
            "success": False,
            "message": "Service category is required"
        }), 400

    if not isinstance(description, str):
        return jsonify({
            "success": False,
            "message": "Description must be text"
        }), 400

    if (
        isinstance(base_price, bool)
        or not isinstance(base_price, (int, float))
        or base_price < 0
    ):
        return jsonify({
            "success": False,
            "message": "Base price must be a non-negative number"
        }), 400

    name = name.strip()
    category = category.strip()
    now = datetime.now(timezone.utc)

    try:
        db = get_database()

        existing = db.services.find_one({
            "name": {
                "$regex": f"^{re.escape(name)}$",
                "$options": "i"
            }
        })

        if existing:
            return jsonify({
                "success": False,
                "message": "A service with this name already exists"
            }), 409

        service = {
            "name": name,
            "category": category,
            "description": description.strip(),
            "base_price": float(base_price),
            "is_active": True,
            "created_at": now,
            "updated_at": now
        }

        result = db.services.insert_one(service)
        service["_id"] = str(result.inserted_id)
        service["created_at"] = now.isoformat()
        service["updated_at"] = now.isoformat()

        return jsonify({
            "success": True,
            "message": "Service created successfully",
            "service": service
        }), 201

    except Exception:
        return jsonify({
            "success": False,
            "message": "Unable to create service"
        }), 500


@role_required("admin")
def update_service(service_id):
    """Update an existing service. Admin access only."""
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
            or price < 0
        ):
            return jsonify({
                "success": False,
                "message": "Base price must be a non-negative number"
            }), 400

        updates["base_price"] = float(price)

    updates["updated_at"] = datetime.now(timezone.utc)

    try:
        object_id = ObjectId(service_id)
    except (InvalidId, TypeError):
        return jsonify({
            "success": False,
            "message": "Invalid service ID"
        }), 400

    try:
        db = get_database()

        result = db.services.update_one(
            {"_id": object_id, "is_active": True},
            {"$set": updates}
        )

        if result.matched_count == 0:
            return jsonify({
                "success": False,
                "message": "Active service not found"
            }), 404

        document = db.services.find_one({"_id": object_id})
        service_object = HomeService.from_document(document)
        service_data = service_object.to_dict()
        service_data["is_active"] = document.get("is_active", True)
        service_data["provider_id"] = (
            str(document["provider_id"])
            if document.get("provider_id")
            else None
        )

        return jsonify({
            "success": True,
            "message": "Service updated successfully",
            "service": service_data
        }), 200

    except ValueError:
        return jsonify({
            "success": False,
            "message": "Service data is invalid"
        }), 400

    except Exception:
        return jsonify({
            "success": False,
            "message": "Unable to update service"
        }), 500


@role_required("admin")
def deactivate_service(service_id):
    """Deactivate a service without deleting its record."""
    try:
        object_id = ObjectId(service_id)
    except (InvalidId, TypeError):
        return jsonify({
            "success": False,
            "message": "Invalid service ID"
        }), 400

    try:
        db = get_database()

        result = db.services.update_one(
            {"_id": object_id, "is_active": True},
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
                "message": "Active service not found"
            }), 404

        return jsonify({
            "success": True,
            "message": "Service deactivated successfully"
        }), 200

    except Exception:
        return jsonify({
            "success": False,
            "message": "Unable to deactivate service"
        }), 500



