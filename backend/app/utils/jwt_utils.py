
import os
import jwt

from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()


def generate_token(user_id: str, role: str) -> str:
    secret = os.getenv("JWT_SECRET")

    if not secret:
        raise ValueError("JWT_SECRET is not configured")

    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24)
    }

    return jwt.encode(
        payload,
        secret,
        algorithm="HS256"
    )
