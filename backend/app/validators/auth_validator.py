from pydantic import ValidationError
from app.models.user import UserCreate


def validate_register_data(data):
    try:
        user = UserCreate(**data)
        return user, None
    except ValidationError as error:
        return None, error.errors()