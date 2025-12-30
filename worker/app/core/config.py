from pydantic import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CivicOp Worker"
    REDIS_URL: str = "redis://localhost:6379/0"
    DATABASE_URL: str = "postgresql://civicop_user:civicop_pass@localhost/civicop"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET: str = "civicop-images"

    class Config:
        env_file = ".env"

settings = Settings()