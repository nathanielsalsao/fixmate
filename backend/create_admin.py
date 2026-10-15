from datetime import datetime, timezone
from getpass import getpass

from app.database.mongodb import get_database
from app.utils.password_utils import hash_password


def create_admin():
    db = get_database()
    users = db["users"]

    name = input("Admin name: ").strip()
    email = input("Admin email: ").strip().lower()
    phone = input("Admin phone: ").strip()

    if not name or not email or not phone:
        print("Name, email, and phone are required.")
        return

    if users.find_one({"email": email}):
        print("This email is already registered. Use another email.")
        return

    password = getpass("Admin password (minimum 12 characters): ")
    confirm_password = getpass("Confirm admin password: ")

    if len(password) < 12:
        print("Password must be at least 12 characters.")
        return

    if password != confirm_password:
        print("Passwords do not match.")
        return

    admin = {
        "name": name,
        "email": email,
        "password": hash_password(password),
        "phone": phone,
        "role": "admin",
        "created_at": datetime.now(timezone.utc),
    }

    result = users.insert_one(admin)

    print("\nAdmin account created successfully!")
    print(f"Admin ID: {result.inserted_id}")
    print(f"Admin email: {email}")
    print("Password stored as a hash; it was not displayed.")


if __name__ == "__main__":
    create_admin()
