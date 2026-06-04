from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Kari DV Support API"
    debug: bool = True
    allowed_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
