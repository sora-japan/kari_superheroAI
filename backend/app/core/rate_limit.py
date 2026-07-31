from collections import defaultdict, deque
from datetime import datetime, timedelta

from fastapi import HTTPException, status

from app.core.config import settings

# session_id → 直近1分間のリクエスト時刻
_recent_requests: dict[str, deque[datetime]] = defaultdict(deque)
# session_id → セッション生存期間中の累計リクエスト数
_session_totals: dict[str, int] = defaultdict(int)


def check_rate_limit(session_id: str) -> None:
    now = datetime.now()
    recent = _recent_requests[session_id]

    while recent and now - recent[0] > timedelta(minutes=1):
        recent.popleft()

    if len(recent) >= settings.rate_limit_per_minute:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"リクエストが多すぎます。しばらく待ってから再度お試しください。（上限: {settings.rate_limit_per_minute}回/分）",
        )

    if _session_totals[session_id] >= settings.rate_limit_session_max:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"このセッションのリクエスト上限（{settings.rate_limit_session_max}回）に達しました。",
        )

    recent.append(now)
    _session_totals[session_id] += 1


def cleanup_session(session_id: str) -> None:
    _recent_requests.pop(session_id, None)
    _session_totals.pop(session_id, None)
