from datetime import datetime, timezone
from enum import Enum

from odmantic import Model, Field


class UserRole(str, Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    RECEPTIONIST = "receptionist"


class User(Model):
    full_name: str
    email: str = Field(unique=True)
    hashed_password: str

    role: UserRole = UserRole.RECEPTIONIST
    is_active: bool = True

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    model_config = {
        "collection": "users",
    }