
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6)
    phone: str = Field(min_length=10, max_length=15)
    role: Literal["customer", "provider"] = "customer"


class UserResponse(BaseModel):
    name: str
    email: EmailStr
    phone: str
    role: str
    created_at: datetime
