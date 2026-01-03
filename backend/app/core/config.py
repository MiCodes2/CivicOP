from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "GuardTech"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key-here"
    
    # Database Configuration (Supabase)
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/guardtech"
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    
    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # AWS S3 Configuration
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    S3_BUCKET: str = "guardtech-images"
    
    # AI/ML Configuration
    OPENAI_API_KEY: str = ""
    
    # CORS Configuration
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3041"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()