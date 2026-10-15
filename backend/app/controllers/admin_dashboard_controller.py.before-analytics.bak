from flask import jsonify

from app.database.mongodb import get_database
from app.middleware.auth_middleware import role_required


@role_required("admin")
def get_admin_dashboard():
    try:
        db = get_database()

        users = {
            "customers": db.users.count_documents({"role": "customer"}),
            "providers": db.users.count_documents({"role": "provider"}),
            "admins": db.users.count_documents({"role": "admin"}),
        }

        services = {
            "total": db.services.count_documents({}),
            "active": db.services.count_documents({"is_active": True}),
            "inactive": db.services.count_documents({"is_active": False}),
        }

        statuses = [
            "pending", "confirmed", "in_progress",
            "completed", "cancelled"
        ]

        bookings = {"total": db.bookings.count_documents({})}

        for status in statuses:
            bookings[status] = db.bookings.count_documents(
                {"status": status}
            )

        recent = list(
            db.bookings.find({}).sort("created_at", -1).limit(5)
        )

        recent_bookings = []

        for item in recent:
            recent_bookings.append({
                "id": str(item["_id"]),
                "service_name": item.get("service_name", ""),
                "status": item.get("status", "pending"),
                "base_price": float(item.get("base_price", 0)),
                "created_at": (
                    item["created_at"].isoformat()
                    if item.get("created_at") else None
                ),
            })

        return jsonify({
            "success": True,
            "dashboard": {
                "users": users,
                "services": services,
                "bookings": bookings,
                "recent_bookings": recent_bookings,
            }
        }), 200

    except Exception:
        return jsonify({
            "success": False,
            "message": "Unable to retrieve admin dashboard data"
        }), 500
