from datetime import datetime, timezone
from typing import Optional

from odmantic import AIOEngine

from app.models.session import Session


async def create_session(
    engine: AIOEngine,
    session: Session,
) -> Session:
    """Create a new login session in MongoDB."""
    return await engine.save(session)


async def get_session_by_key(
    engine: AIOEngine,
    session_key: str,
) -> Optional[Session]:
    """Find a session by its unique session key."""
    return await engine.find_one(
        Session,
        Session.session_key == session_key,
    )


async def get_session_by_refresh_token_hash(
    engine: AIOEngine,
    refresh_token_hash: str,
) -> Optional[Session]:
    """Find a session using the hash of its current refresh token."""
    return await engine.find_one(
        Session,
        Session.refresh_token_hash == refresh_token_hash,
    )


async def rotate_refresh_token(
    engine: AIOEngine,
    session: Session,
    new_refresh_token_hash: str,
) -> Session:
    """Replace the stored refresh-token hash."""
    session.refresh_token_hash = new_refresh_token_hash
    session.last_used_at = datetime.now(timezone.utc)

    return await engine.save(session)


async def revoke_session(
    engine: AIOEngine,
    session: Session,
) -> Session:
    """Mark a session as revoked."""
    if session.revoked_at is None:
        session.revoked_at = datetime.now(timezone.utc)
        await engine.save(session)

    return session
