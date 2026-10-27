from motor.motor_asyncio import AsyncIOMotorClient
from odmantic import AIOEngine

from app.core.config import settings


client = AsyncIOMotorClient(settings.DATABASE_URL)

engine = AIOEngine(
    client=client,
    database=settings.DATABASE_NAME,
)


async def connect_to_mongodb() -> None:
    await client.admin.command("ping")


async def close_mongodb_connection() -> None:
    client.close()