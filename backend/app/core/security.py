from jose import JWTError, jwt

from app.core.config import settings


def decode_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )

        subject = payload.get("sub")

        if not subject or not isinstance(subject, str):
            return None

        return payload

    except JWTError:
        return None