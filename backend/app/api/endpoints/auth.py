from datetime import datetime, timedelta, timezone
import secrets
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    Response,
    status,
)
from fastapi.security import OAuth2PasswordRequestForm
from odmantic import ObjectId
from pydantic import BaseModel
from pymongo.errors import DuplicateKeyError

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.crud.session import (
    create_session,
    get_session_by_refresh_token_hash,
    rotate_refresh_token,
)
from app.crud.user import (
    create_user,
    get_user_by_email,
    get_user_by_id,
)
from app.db.database import engine
from app.models.session import Session
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserResponse
from app.services.auth import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    hash_password,
    hash_refresh_token,
)


router = APIRouter(tags=["Authentication"])

REFRESH_TOKEN_EXPIRE_DAYS = 7
REFRESH_COOKIE_NAME = "refresh_token"
REFRESH_COOKIE_PATH = "/api/v1/auth"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


def serialize_user(user: User) -> dict:
    return {
        "id": str(user.id),
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }


def set_refresh_cookie(
    response: Response,
    refresh_token: str,
    expires_at: datetime,
) -> None:
    now = datetime.now(timezone.utc)
    max_age = max(0, int((expires_at - now).total_seconds()))

    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=max_age,
        expires=expires_at,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="lax",
        path=REFRESH_COOKIE_PATH,
    )


def clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path=REFRESH_COOKIE_PATH,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="lax",
    )


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register_user(user_data: UserCreate):
    email = str(user_data.email).lower()

    existing_user = await get_user_by_email(email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    user = User(
        full_name=user_data.full_name,
        email=email,
        hashed_password=hash_password(user_data.password),
        role=UserRole.RECEPTIONIST,
    )

    try:
        created_user = await create_user(user)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    return serialize_user(created_user)


@router.post("/login", response_model=TokenResponse)
async def login_user(
    response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
):
    user = await authenticate_user(
        email=form_data.username.strip().lower(),
        password=form_data.password,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    now = datetime.now(timezone.utc)
    session_expires_at = now + timedelta(
        days=REFRESH_TOKEN_EXPIRE_DAYS
    )

    refresh_token = create_refresh_token()

    session = Session(
        session_key=secrets.token_urlsafe(32),
        user_id=str(user.id),
        refresh_token_hash=hash_refresh_token(refresh_token),
        expires_at=session_expires_at,
    )

    await create_session(engine, session)

    access_token = create_access_token(subject=str(user.id))

    set_refresh_cookie(
        response,
        refresh_token,
        session_expires_at,
    )

    return TokenResponse(access_token=access_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    request: Request,
    response: Response,
):
    refresh_token = request.cookies.get(REFRESH_COOKIE_NAME)

    if not refresh_token:
        clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing",
        )

    session = await get_session_by_refresh_token_hash(
        engine,
        hash_refresh_token(refresh_token),
    )

    if session is None or session.revoked_at is not None:
        clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    now = datetime.now(timezone.utc)
    expires_at = session.expires_at

    # MongoDB may return a naive datetime, depending on its configuration.
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at <= now:
        clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired",
        )

    try:
        user_id = ObjectId(session.user_id)
    except (ValueError, TypeError):
        clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session user",
        )

    user = await get_user_by_id(user_id)

    if user is None or not user.is_active:
        clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is unavailable",
        )

    # Replace the old refresh-token hash with the new token's hash.
    new_refresh_token = create_refresh_token()

    await rotate_refresh_token(
        engine,
        session,
        hash_refresh_token(new_refresh_token),
    )

    access_token = create_access_token(subject=str(user.id))

    # Preserve the session's original absolute expiry.
    set_refresh_cookie(
        response,
        new_refresh_token,
        expires_at,
    )

    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return serialize_user(current_user)
