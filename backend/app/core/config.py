from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator
from typing import List, Optional


class Settings(BaseSettings):
    """
    Central application configuration.

    Loads values from environment variables (.env file).
    """

    # ----------------------------------------------------
    # Project Info
    # ----------------------------------------------------
    PROJECT_NAME: str = Field(..., description="Name of the project")
    VERSION: str = Field(..., description="Application version")
    DEBUG: bool = Field(False, description="Enable debug mode")

    # ----------------------------------------------------
    # Database
    # ----------------------------------------------------
    DATABASE_URL: str = Field(..., description="SQLAlchemy database URL")
    DATABASE_POOL_SIZE: int = Field(5, ge=1)
    DATABASE_MAX_OVERFLOW: int = Field(10, ge=0)

    # ----------------------------------------------------
    # Security / Auth
    # ----------------------------------------------------
    SECRET_KEY: str = Field(..., min_length=32, description="JWT signing key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(30, ge=5)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(30, ge=1)
    ALGORITHM: str = Field("HS256")
    PASSWORD_HASH_ROUNDS: int = Field(12, ge=8)

    # ----------------------------------------------------
    # Cookies
    # ----------------------------------------------------
    COOKIE_SECURE: bool = Field(True)
    COOKIE_HTTPONLY: bool = Field(True)
    COOKIE_SAMESITE: str = Field("lax")
    COOKIE_DOMAIN: Optional[str] = None

    @field_validator("COOKIE_SAMESITE")
    def validate_samesite(cls, v):
        allowed = {"lax", "strict", "none"}
        if v.lower() not in allowed:
            raise ValueError(f"COOKIE_SAMESITE must be one of {allowed}")
        return v.lower()

    # ----------------------------------------------------
    # CORS
    # ----------------------------------------------------
    CORS_ORIGINS: List[str] = Field(default_factory=list)

    @field_validator("CORS_ORIGINS", mode="before")
    def split_cors(cls, v):
        """
        Allows:
        CORS_ORIGINS="http://localhost:3000,https://example.com"
        """
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # ----------------------------------------------------
    # Email Settings
    # ----------------------------------------------------
    SMTP_HOST: str = Field(...)
    SMTP_PORT: int = Field(587)
    SMTP_USER: str = Field(...)
    SMTP_PASSWORD: str = Field(...)
    EMAILS_FROM_EMAIL: str = Field(...)
    EMAILS_FROM_NAME: str = Field("DestinyPal")

    TURNSTILE_SECRET_KEY: str

    # ----------------------------------------------------
    # Payment Providers
    # ----------------------------------------------------
    # MPESA
    MPESA_CONSUMER_KEY: str
    MPESA_CONSUMER_SECRET: str
    MPESA_PASSKEY: str
    MPESA_SHORTCODE: str
    MPESA_CALLBACK_URL: str
    MPESA_ENVIRONMENT: str = Field(default="sandbox", pattern="^(sandbox|production)$")

    # Airtel Money
    AIRTEL_CLIENT_ID: str
    AIRTEL_CLIENT_SECRET: str
    AIRTEL_CALLBACK_URL: str

    # ----------------------------------------------------
    # Rate Limiting
    # ----------------------------------------------------
    RATE_LIMIT_REQUESTS: int = Field(60)
    RATE_LIMIT_WINDOW_SECONDS: int = Field(60)

    # ----------------------------------------------------
    # Pydantic Config
    # ----------------------------------------------------
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


# Lazy-loaded settings
settings = Settings()
def get_settings() -> Settings:
    """Get application settings (for dependency injection)."""
    return settings