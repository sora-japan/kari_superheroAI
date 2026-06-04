from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    # Step 1: stub response — Claude API integration comes in Step 2
    return ChatResponse(
        reply="こんにちは。安心して話してください。（Step 2でAI応答に置き換えられます）",
        session_id=req.session_id or "stub-session",
    )
