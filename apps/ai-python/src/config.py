"""Configuration management for the AI service."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application settings
    app_name: str = "SaverFox AI Service"
    app_version: str = "1.0.0"
    debug: bool = False
    api_prefix: str = "/api"
    
    # Server settings
    host: str = "0.0.0.0"
    port: int = 8001
    
    # CORS settings
    cors_origins: str = "http://localhost:3000,http://localhost:8000"
    cors_allow_credentials: bool = True
    cors_allow_methods: list[str] = ["*"]
    cors_allow_headers: list[str] = ["*"]
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    # LLM Provider settings
    llm_provider: str = "openai"  # "openai", "gemini", or "kimi"
    
    # OpenAI settings
    openai_api_key: str = ""
    openai_model: str = "gpt-4"
    openai_temperature: float = 0.7
    openai_max_tokens: int = 1000
    
    # Gemini settings
    gemini_api_key: str = ""
    gemini_model: str = "gemini-pro"
    gemini_temperature: float = 0.7
    gemini_max_tokens: int = 1000
    
    # Kimi (Moonshot) settings
    kimi_api_key: str = ""
    kimi_model: str = "moonshot-v1-8k"
    kimi_temperature: float = 0.7
    kimi_max_tokens: int = 1000
    
    # Opik settings
    opik_api_key: str = ""
    opik_project_name: str = "saverfox-ai"
    opik_workspace: str = "default"


# Global settings instance
settings = Settings()
