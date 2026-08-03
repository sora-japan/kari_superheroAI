from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.security import verify_api_key

router = APIRouter(dependencies=[Depends(verify_api_key)])


class SeesionRequest(BaseModel):
    message: str
    session_id: str | None = None


class SeesionResponse(BaseModel):
    reply: str
    session_id: str


@router.post("/seesion", response_model=SeesionResponse)
async def Seesion(req: SeesionRequest):
    # Step 1: stub response — Claude API integration comes in Step 2
    return SeesionResponse(
        reply="こんにちは。安心して話してください。（Step 2でAI応答に置き換えられます）",
        session_id=req.session_id or "stub-session",
    )
