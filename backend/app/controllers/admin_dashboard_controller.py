from collections import Counter
from datetime import datetime, timezone

from flask import jsonify

from app.database.mongodb import get_database
from app.middleware.auth_middleware import role_required


def _iso(value):
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value)


def _parse_date(value):
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    return None


def _safe_price(value):
    try:
        price = float(value or 0)
        return price if price >= 0 else 0
    except (TypeError, ValueError):
        return 0


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

        status_names = [
            "pending", "confirmed", "in_progress", "completed", "cancelled"
        ]

        booking_documents = list(
            db.bookings.find({}).sort("created_at", -1)
        )

        booking_counts = {
            "total": len(booking_documents),
            "pending": 0,
            "confirmed": 0,
            "in_progress": 0,
            "completed": 0,
            "cancelled": 0,
        }

        user_documents = list(db.users.find(
            {},
            {"name": 1, "email": 1, "role": 1}
        ))

        user_map = {
            str(item["_id"]): item
            for item in user_documents
        }

        transactions = []
        monthly_counts = Counter()
        service_counts = Counter()

        now = datetime.now(timezone.utc)
        month_keys = []

        for offset in range(5, -1, -1):
            month_index = now.month - 1 - offset
            year = now.year + month_index // 12
            month = month_index % 12 + 1
            month_keys.append((year, month))

        for item in booking_documents:
            status = str(item.get("status", "pending")).lower().strip()
            if status in booking_counts:
                booking_counts[status] += 1

            service_name = str(
                item.get("service_name") or "Unspecified service"
            )
            service_counts[service_name] += 1

            created = _parse_date(item.get("created_at"))
            if created:
                if created.tzinfo is None:
                    created = created.replace(tzinfo=timezone.utc)
                month_key = (created.year, created.month)
                if month_key in month_keys:
                    monthly_counts[month_key] += 1

            customer = user_map.get(str(item.get("customer_id")), {})
            provider = user_map.get(str(item.get("provider_id")), {})

            transactions.append({
                "id": str(item.get("_id", "")),
                "service_name": service_name,
                "category": str(item.get("category") or "Other"),
                "status": status,
                "base_price": _safe_price(item.get("base_price")),
                "booking_date": _iso(item.get("booking_date")),
                "created_at": _iso(item.get("created_at")),
                "updated_at": _iso(item.get("updated_at")),
                "customer_id": (
                    str(item["customer_id"])
                    if item.get("customer_id") is not None else None
                ),
                "customer_name": customer.get("name", "Unknown customer"),
                "customer_email": customer.get("email", ""),
                "provider_id": (
                    str(item["provider_id"])
                    if item.get("provider_id") is not None else None
                ),
                "provider_name": provider.get("name", "Unassigned"),
                "address": str(item.get("address") or ""),
                "notes": str(item.get("notes") or ""),
            })

        monthly_bookings = []
        for year, month in month_keys:
            month_date = datetime(year, month, 1)
            monthly_bookings.append({
                "month": month_date.strftime("%b %Y"),
                "bookings": monthly_counts[(year, month)],
            })

        popular_services = [
            {"name": name, "bookings": count}
            for name, count in service_counts.most_common(6)
        ]

        recent_bookings = [
            {
                "id": item["id"],
                "service_name": item["service_name"],
                "status": item["status"],
                "base_price": item["base_price"],
                "created_at": item["created_at"],
            }
            for item in transactions[:5]
        ]
        total_booking_value = sum(
            item["base_price"] for item in transactions
        )

        return jsonify({
            "success": True,
            "dashboard": {
                "users": users,
                "services": services,
                "bookings": booking_counts,
                "recent_bookings": recent_bookings,
                "transactions": transactions,
                "monthly_bookings": monthly_bookings,
                "popular_services": popular_services,
                "total_booking_value": round(total_booking_value, 2),
            }
        }), 200

    except Exception:
        return jsonify({
            "success": False,
            "message": "Unable to retrieve admin dashboard data"
        }), 500

