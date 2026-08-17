from fastapi import HTTPException, status

from app.core.config import settings
from app.core.redis_client import get_redis

_MINUTE_WINDOW_SECONDS = 60


async def check_rate_limit(session_id: str) -> None:
    redis = get_redis()
    minute_key = f"ratelimit:minute:{session_id}"
    total_key = f"ratelimit:total:{session_id}"

    minute_count = await redis.incr(minute_key)
    if minute_count == 1:
        await redis.expire(minute_key, _MINUTE_WINDOW_SECONDS)

    if minute_count > settings.rate_limit_per_minute:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"リクエストが多すぎます。しばらく待ってから再度お試しください。（上限: {settings.rate_limit_per_minute}回/分）",
        )

    total_count = await redis.incr(total_key)
    if total_count == 1:
        await redis.expire(total_key, settings.session_ttl_minutes * 60)

    if total_count > settings.rate_limit_session_max:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"このセッションのリクエスト上限（{settings.rate_limit_session_max}回）に達しました。",
        )


async def cleanup_session(session_id: str) -> None:
    redis = get_redis()
    await redis.delete(f"ratelimit:minute:{session_id}", f"ratelimit:total:{session_id}")
