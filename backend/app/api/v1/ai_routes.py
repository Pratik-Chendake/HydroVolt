from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import TariffConfig, DeviceConfig
from app.schemas.schemas import AIInsightsResponse
from app.services.ai_service import ai_service

router = APIRouter(prefix="/ai", tags=["AI Insights"])

@router.get("/insights", response_model=AIInsightsResponse)
def get_ai_insights(db: Session = Depends(get_db)):
    tariff = db.query(TariffConfig).first()
    config = db.query(DeviceConfig).first()
    return ai_service.generate_insights(db, tariff, config)
