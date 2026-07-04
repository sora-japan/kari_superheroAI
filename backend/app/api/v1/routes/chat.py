from typing import Literal

from fastapi import APIRouter, HTTPException
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


class ChatMessagesRequest(BaseModel):
    message: str = ""
    category: str | None = None
    quickReply: str | None = None
    session_id: str | None = None


class MessageItem(BaseModel):
    role: Literal["user", "ai"]
    message: str


class ChatMessagesResponse(BaseModel):
    messages: list[MessageItem]
    session_id: str


def _build_lc_messages(history: list[dict], category: str | None = None) -> list:
    system_prompt = SYSTEM_PROMPT
    if category:
        system_prompt += (
            f"\n\nユーザーは「{category}」に関する相談を選んでいます。"
            "この文脈を踏まえて応答してください。"
        )
    messages = [SystemMessage(content=system_prompt)]
    for msg in history:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["message"]))
        else:
            messages.append(AIMessage(content=msg["message"]))
    return messages


def _get_ai_reply(session_id: str, category: str | None = None) -> str:
    if not settings.google_api_key or settings.google_api_key == "your_gemini_api_key_here":
        # スタブ応答でフロー全体をテスト
        last_message = chat_histories[session_id][-1]["message"]
        return f"（テスト応答）「{last_message}」について受け付けました。"

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.google_api_key,
    )
    lc_messages = _build_lc_messages(chat_histories[session_id], category=category)
    response = llm.invoke(lc_messages)
    return str(response.content)


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())

    if session_id not in chat_histories:
        chat_histories[session_id] = []

    chat_histories[session_id].append({"role": "user", "message": req.message})

    reply = _get_ai_reply(session_id)
    chat_histories[session_id].append({"role": "ai", "message": reply})

    return ChatResponse(reply=reply, session_id=session_id)


@router.post("/chat/messages", response_model=ChatMessagesResponse)
async def chat_messages(req: ChatMessagesRequest):
    """チェックリスト／カテゴリー選択／クイックリプライからの入力をAIに渡して応答を返す。"""
    session_id = req.session_id or str(uuid.uuid4())

    if session_id not in chat_histories:
        chat_histories[session_id] = []

    user_text = req.message.strip() or req.quickReply or req.category
    if not user_text:
        raise HTTPException(
            status_code=400,
            detail="message, category, quickReply のいずれかを指定してください。",
        )

    chat_histories[session_id].append({"role": "user", "message": user_text})

    reply = _get_ai_reply(session_id, category=req.category)
    chat_histories[session_id].append({"role": "ai", "message": reply})

    return ChatMessagesResponse(
        messages=[
            MessageItem(role="user", message=user_text),
            MessageItem(role="ai", message=reply),
        ],
        session_id=session_id,
    )
