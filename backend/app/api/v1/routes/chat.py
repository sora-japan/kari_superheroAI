from fastapi import APIRouter
from pydantic import BaseModel
import uuid
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.core.config import settings

router = APIRouter()

# session_id → メッセージ履歴 のインメモリストア
chat_histories: dict[str, list[dict]] = {}

SYSTEM_PROMPT = """あなたはDV（家庭内暴力）被害者を支援するAIカウンセラーです。
以下の方針で対応してください。

- 相手の気持ちに寄り添い、否定せず、温かく受け止める
- 具体的な行動を急かさず、まず話を聞く姿勢を持つ
- 危険な状況には110番や#8891（DV相談ナビ）を案内する
- 個人を特定する情報は求めない
- 回答は簡潔で読みやすい日本語にする"""


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str


def _build_lc_messages(history: list[dict]) -> list:
    messages = [SystemMessage(content=SYSTEM_PROMPT)]
    for msg in history:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["message"]))
        else:
            messages.append(AIMessage(content=msg["message"]))
    return messages


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())

    if session_id not in chat_histories:
        chat_histories[session_id] = []

    chat_histories[session_id].append({"role": "user", "message": req.message})

    if not settings.google_api_key:
        # スタブ応答でフロー全体をテスト
        reply = f"（テスト応答）「{req.message}」について受け付けました。"
        chat_histories[session_id].append({"role": "ai", "message": reply})
        return ChatResponse(reply=reply, session_id=session_id)

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.google_api_key,
    )
    lc_messages = _build_lc_messages(chat_histories[session_id])
    response = llm.invoke(lc_messages)
    reply = str(response.content)

    chat_histories[session_id].append({"role": "ai", "message": reply})

    return ChatResponse(reply=reply, session_id=session_id)
