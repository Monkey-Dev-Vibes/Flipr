from pydantic_settings import BaseSettings


APP_VERSION = "0.1.0"


class Settings(BaseSettings):
    app_name: str = "Flipr API"
    debug: bool = False

    # CORS
    frontend_url: str = "http://localhost:3000"

    # Anthropic
    anthropic_api_key: str = ""

    # Hyperliquid
    hyperliquid_testnet: bool = True

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
