from __future__ import annotations

from functools import lru_cache

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings.

    Environment variables use prefix ``POSTGRESOPS_`` (e.g. ``POSTGRESOPS_DATABASE_URL``).
    """

    model_config = SettingsConfigDict(
        env_prefix="POSTGRESOPS_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    env: str = Field(default="development")
    api_host: str = Field(default="0.0.0.0")
    api_port: int = Field(default=8000)

    database_url: str = Field(
        default="postgresql+asyncpg://postgres:postgres@127.0.0.1:55432/postgresops",
    )

    @computed_field  # type: ignore[prop-decorator]
    @property
    def database_url_sync(self) -> str:
        return self.database_url.replace("postgresql+asyncpg://", "postgresql+psycopg://").replace(
            "postgresql://", "postgresql+psycopg://"
        )

    redis_url: str = Field(default="redis://127.0.0.1:56379/0")
    jwt_secret: str = Field(default="dev-secret-change-in-production")

    cors_origins: str = Field(
        default="*",
        description="Comma-separated origins, or * for all (dev only in production).",
    )
    build_id: str = Field(default="local", description="Git SHA or build label for /meta.")

    log_json: bool = Field(default=False, description="Emit JSON logs instead of console.")

    @computed_field  # type: ignore[prop-decorator]
    @property
    def cors_origin_list(self) -> list[str]:
        raw = self.cors_origins.strip()
        if raw == "*":
            return ["*"]
        return [o.strip() for o in raw.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


def clear_settings_cache() -> None:
    """Used in tests or reload scenarios."""
    get_settings.cache_clear()


settings = get_settings()
