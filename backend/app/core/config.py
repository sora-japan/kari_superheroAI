import json
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode


class Settings(BaseSettings):
    app_name: str = "Kari DV Support API"
    debug: bool = True
    allowed_origins: Annotated[list[str], NoDecode] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    google_api_key: str = ""
    session_ttl_minutes: int = 15
    x_api_key: str = ""
    rate_limit_per_minute: int = 10
    rate_limit_session_max: int = 30
    redis_url: str = ""

    class Config:
        env_file = ".env"

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_allowed_origins(cls, value: object) -> object:
        if isinstance(value, str):
            value = value.strip()
            if value.startswith("["):
                return json.loads(value)
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


settings = Settings()
