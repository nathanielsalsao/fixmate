import os

from pymongo import MongoClient
from dotenv import load_dotenv


load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "fixmate")


if not MONGO_URI:
    raise ValueError("MONGO_URI is not configured in .env")


client = MongoClient(MONGO_URI)

db = client[DATABASE_NAME]


def get_database():
    return db