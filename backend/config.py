from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Fallback to local sqlite to ensure execution runs perfectly locally
    DATABASE_URL: str = "sqlite:///./repaysignal.db"
    MODEL_CACHE_DIR: str = "../models_cache"
    GEMINI_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
