from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    PROJECT_NAME: str = "Smart Water & Energy Manager"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./water_manager.db")
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    DEFAULT_SERIAL_PORT: str = os.getenv("SERIAL_PORT", "COM3")
    DEFAULT_BAUD_RATE: int = int(os.getenv("SERIAL_BAUD_RATE", "9600"))
    DEFAULT_CALIBRATION_FACTOR: float = 450.0 # Pulses per liter for YF-S201

    # Supabase Cloud Configuration
    SUPABASE_URL: str = os.getenv(
        "SUPABASE_URL",
        "https://escefqdmzcqcfbgqwjil.supabase.co"
    )
    SUPABASE_ANON_KEY: str = os.getenv(
        "SUPABASE_ANON_KEY",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzY2VmcWRtemNxY2ZiZ3F3amlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5NDEyNDEsImV4cCI6MjEwODUxNzI0MX0.QuZxSzCk1LItK8XOUIWczXQhUz6FhnAgZnddZhKtiqc"
    )
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv(
        "SUPABASE_SERVICE_ROLE_KEY",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzY2VmcWRtemNxY2ZiZ3F3amlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mjk0MTI0MSwiZXhwIjoyMTA4NTE3MjQxfQ.lSD9VuVlho5KdRfV5GoUcGQ4qbwas__gUfhGisV9gBA"
    )
    SUPABASE_ENABLED: bool = os.getenv("SUPABASE_ENABLED", "true").lower() in ("true", "1", "yes")

settings = Settings()
