import secrets

from fastapi import Header, HTTPException, status

from app.core.config import settings


async def verify_api_key(x_api_key: str = Header(default="", alias="x-api-key")) -> None:
    if not settings.x_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="X_API_KEY is not configured on the server.",
        )
    if not x_api_key or not secrets.compare_digest(x_api_key, settings.x_api_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key.",
        )
