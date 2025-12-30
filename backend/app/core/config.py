from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CivicOp"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-here"
    DATABASE_URL: str = "postgresql://civicop_user:civicop_pass@localhost:5440/civicop"
    REDIS_URL: str = "redis://localhost:6379/0"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET: str = "civicop-images"

    class Config:
        env_file = ".env"

settings = Settings()