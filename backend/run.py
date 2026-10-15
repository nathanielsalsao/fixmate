from app import create_app
from app.database.mongodb import get_database


app = create_app()


if __name__ == "__main__":
    try:
        db = get_database()

        db.command("ping")

        print("MongoDB connection successful!")
        print(f"Database: {db.name}")

    except Exception as e:
        print("MongoDB connection failed!")
        print(e)

    app.run(debug=True)