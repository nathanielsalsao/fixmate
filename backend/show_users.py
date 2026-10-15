from app.database.mongodb import get_database

db = get_database()

for role in ("customer", "provider", "admin"):
    users = list(
        db.users.find(
            {"role": role},
            {"name": 1, "email": 1, "phone": 1, "role": 1, "_id": 0}
        ).sort("name", 1)
    )

    if not users:
        print("No users found.")

    for user in users:
        print(f"Name:  {user.get('name', 'N/A')}")
        print(f"Email: {user.get('email', 'N/A')}")
        print(f"Phone: {user.get('phone', 'N/A')}")
        print(f"Role:  {user.get('role', 'N/A')}")
        print("-" * 30)

print("\nUser listing complete.")
