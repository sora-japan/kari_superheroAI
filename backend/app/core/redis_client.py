from functools import lru_cache

from redis.asyncio import Redis
from redis.asyncio.retry import Retry
from redis.backoff import ExponentialBackoff
from redis.exceptions import ConnectionError, TimeoutError

from app.core.config import settings


@lru_cache
def get_redis() -> Redis:
    return Redis.from_url(
        settings.redis_url,
        decode_responses=True,
        # Redis Cloudがアイドル接続を切断するため、健全性チェックと自動再試行で復旧させる
        health_check_interval=30,
        socket_keepalive=True,
        retry_on_error=[ConnectionError, TimeoutError],
        retry=Retry(ExponentialBackoff(), 3),
    )
