from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import TariffConfig
from app.schemas.schemas import AnalyticsSummaryOut
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics & Trends"])

@router.get("/summary", response_model=AnalyticsSummaryOut)
def get_analytics_summary(db: Session = Depends(get_db)):
    tariff = db.query(TariffConfig).first()
    return analytics_service.get_analytics_summary(db, tariff)
