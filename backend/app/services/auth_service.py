
from datetime import datetime, timezone

from app.database.mongodb import get_database
from app.utils.password_utils import hash_password, verify_password
from app.utils.jwt_utils import generate_token


def register_user(user_data):
    db = get_database()
    users_collection = db["users"]

    email = user_data.email.strip().lower()

    existing_user = users_collection.find_one({
        "email": email
    })

    if existing_user:
        return None, "Email is already registered"

    hashed_password = hash_password(user_data.password)

    user_document = {
        "name": user_data.name,
        "email": email,
        "password": hashed_password,
        "phone": user_data.phone,
        "role": user_data.role,
        "created_at": datetime.now(timezone.utc)
    }

    result = users_collection.insert_one(user_document)

    return {
        "id": str(result.inserted_id),
        "name": user_data.name,
        "email": user_data.email,
        "phone": user_data.phone,
        "role": user_data.role,
        "created_at": user_document["created_at"].isoformat()
    }, None


def login_user(email: str, password: str):
    db = get_database()
    users_collection = db["users"]

    email = email.strip().lower()

    user = users_collection.find_one({
        "email": email
    })

    if not user:
        return None, "Invalid email or password"

    if not verify_password(password, user["password"]):
        return None, "Invalid email or password"

    token = generate_token(
        str(user["_id"]),
        user["role"]
    )

    return {
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "phone": user["phone"],
            "role": user["role"]
        }
    }, None
