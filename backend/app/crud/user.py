from odmantic import ObjectId

from app.db.database import engine
from app.models.user import User


async def get_user_by_email(email: str) -> User | None:
    return await engine.find_one(
        User,
        User.email == email.lower(),
    )


async def get_user_by_id(user_id: ObjectId) -> User | None:
    return await engine.find_one(
        User,
        User.id == user_id,
    )


async def create_user(user: User) -> User:
    user.email = user.email.lower()
    return await engine.save(user)


async def update_user(user: User) -> User:
    return await engine.save(user)


async def delete_user(user: User) -> None:
    await engine.delete(user)