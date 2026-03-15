from pydantic_settings import BaseSettings


APP_VERSION = "0.1.0"


class Settings(BaseSettings):
    app_name: str = "Flipr API"
    debug: bool = False
    log_level: str = "info"

    # CORS
    frontend_url: str = "http://localhost:3000"

    # Anthropic
    anthropic_api_key: str = ""

    # Hyperliquid
    hyperliquid_testnet: bool = True

    # Privy
    privy_app_id: str = ""
    privy_app_secret: str = ""
    privy_jwks_url: str = "https://auth.privy.io/api/v1/apps/{app_id}/jwks.json"

    @property
    def is_production(self) -> bool:
        return not self.debug

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
