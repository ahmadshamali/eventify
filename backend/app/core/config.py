import os
from typing import Optional

class Settings:
    """Application settings loaded from environment variables."""
    
    # SMTP Configuration
    SMTP_HOST: str = os.getenv('SMTP_HOST', 'sandbox.smtp.mailtrap.io')
    SMTP_PORT: int = int(os.getenv('SMTP_PORT', '587'))
    SMTP_USER: str = os.getenv('SMTP_USER', '')
    SMTP_PASSWORD: str = os.getenv('SMTP_PASSWORD', '')
    SMTP_FROM_EMAIL: str = os.getenv('SMTP_FROM_EMAIL', os.getenv('SMTP_USER', 'noreply@eventify.local'))
    SMTP_FROM_NAME: str = os.getenv('SMTP_FROM_NAME', 'Eventify')
    
    # Frontend URL for email links
    FRONTEND_URL: str = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    
    # Feature flags
    SMTP_ENABLED: bool = os.getenv('SMTP_ENABLED', 'true').lower() == 'true'

    # JWT configuration
    JWT_SECRET_KEY: str = os.getenv('JWT_SECRET_KEY', 'change-this-in-production')
    JWT_ALGORITHM: str = os.getenv('JWT_ALGORITHM', 'HS256')
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRE_MINUTES', '60'))

    # AI configuration
    # AI configuration (Gemini)
    GEMINI_API_KEY: str = os.getenv('GEMINI_API_KEY', os.getenv('OPENAI_API_KEY', ''))
    GEMINI_BASE_URL: str = os.getenv('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta/openai/')
    GEMINI_MODEL: str = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')


settings = Settings()
