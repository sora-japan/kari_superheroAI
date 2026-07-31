import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.rate_limit import cleanup_session
from app.api.v1.routes import health, chat, session
from app.api.v1.routes.chat import chat_histories, session_last_access

async def cleanup_expired_sessions() -> None:
    while True:
        await asyncio.sleep(settings.session_sweep_interval_seconds)
        now = datetime.now()
        timeout = timedelta(minutes=settings.session_ttl_minutes)
        expired_ids = [session_id for session_id, last_access in session_last_access.items()
                       if now - last_access > timeout]
        for session_id in expired_ids:
                del chat_histories[session_id]
                del session_last_access[session_id]
                cleanup_session(session_id)
                print(f"Session {session_id} expired and cleaned up.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(cleanup_expired_sessions())
    yield
    task.cancel()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url="/docs" if settings.debug else None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])
app.include_router(session.router, prefix="/api/v1", tags=["session"])


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.status_code, "message": exc.detail}},
        headers=exc.headers,
    )


@app.get("/")
async def root():
    return {"message": "Kari Backend is running"}
