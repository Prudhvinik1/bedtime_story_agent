from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env.local",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # Core API settings
    cors_origins_raw: str = Field(default="http://localhost:3000", alias="CORS_ORIGINS")
    max_input_chars: int = Field(default=1000, alias="MAX_INPUT_CHARS")
    rate_limit_window_seconds: int = Field(default=60, alias="RATE_LIMIT_WINDOW_SECONDS")
    rate_limit_max_requests: int = Field(default=30, alias="RATE_LIMIT_MAX_REQUESTS")

    # OpenAI settings
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-3.5-turbo", alias="OPENAI_MODEL")
    openai_timeout_seconds: float = Field(default=30.0, alias="OPENAI_TIMEOUT_SECONDS")

    # Supabase JWT verification settings
    supabase_url: str = Field(default="", alias="SUPABASE_URL")
    supabase_jwks_url: str | None = Field(default=None, alias="SUPABASE_JWKS_URL")
    supabase_issuer: str | None = Field(default=None, alias="SUPABASE_ISSUER")
    supabase_audience: str = Field(default="authenticated", alias="SUPABASE_AUDIENCE")
    supabase_allowed_algorithms_raw: str = Field(
        default="RS256,ES256", alias="SUPABASE_ALLOWED_ALGORITHMS"
    )
    supabase_jwks_cache_ttl_seconds: int = Field(
        default=600, alias="SUPABASE_JWKS_CACHE_TTL_SECONDS"
    )

    @model_validator(mode="after")
    def derive_supabase_defaults(self) -> "Settings":
        base = self.supabase_url.rstrip("/")
        if not self.supabase_jwks_url and base:
            self.supabase_jwks_url = f"{base}/auth/v1/.well-known/jwks.json"
        if not self.supabase_issuer and base:
            self.supabase_issuer = f"{base}/auth/v1"
        return self

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]

    @property
    def supabase_allowed_algorithms(self) -> list[str]:
        return [
            algorithm.strip()
            for algorithm in self.supabase_allowed_algorithms_raw.split(",")
            if algorithm.strip()
        ]


settings = Settings()
