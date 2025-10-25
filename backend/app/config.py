from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional
import os


class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://localhost:27017/metrica_assignment"
    DB_NAME: str = "metrica_assignment"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    PUBLIC_BASE_URL: Optional[str] = None

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), "..", ".env")
        env_file_encoding = "utf-8"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()  # type: ignore
