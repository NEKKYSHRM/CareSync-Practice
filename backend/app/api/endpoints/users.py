from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.core.dependencies import get_current_user
from app.crud.user import get_user_by_email, update_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.auth import hash_password


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.patch("/me", response_model=UserResponse)
async def update_my_profile(
    user_data: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
):
    updates = user_data.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    if "email" in updates and updates["email"] is not None:
        email = str(updates["email"]).lower()

        existing_user = await get_user_by_email(email)

        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists",
            )

        current_user.email = email

    if "full_name" in updates and updates["full_name"] is not None:
        current_user.full_name = updates["full_name"]

    if "password" in updates and updates["password"] is not None:
        current_user.hashed_password = hash_password(updates["password"])

    current_user.updated_at = __import__("datetime").datetime.now(
        __import__("datetime").timezone.utc
    )

    try:
        updated_user = await update_user(current_user)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    return {
        "id": str(updated_user.id),
        "full_name": updated_user.full_name,
        "email": updated_user.email,
        "role": updated_user.role,
        "is_active": updated_user.is_active,
        "created_at": updated_user.created_at,
        "updated_at": updated_user.updated_at,
    }