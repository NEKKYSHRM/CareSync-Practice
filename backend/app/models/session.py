from datetime import datetime, timezone

from odmantic import Field, Model


class Session(Model):
    # Identifies the login session independently of the user ID.
    session_key: str = Field(unique=True)

    # References the associated User.id as a string.
    user_id: str = Field(index=True)

    # Store only the hash of the current refresh token.
    refresh_token_hash: str

    # Absolute session expiry.
    expires_at: datetime = Field(index=True)

    # None means the session has not been revoked.
    revoked_at: datetime | None = None

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    last_used_at: datetime | None = None

    model_config = {
        "collection": "sessions",
    }
