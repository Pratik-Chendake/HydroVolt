from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.database import get_db
from app.models.models import WaterReading, TariffConfig, Alert
from app.schemas.schemas import LiveWaterStatus, WaterReadingOut
from app.services.serial_service import serial_service
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/water", tags=["Water Telemetry"])

@router.get("/live", response_model=LiveWaterStatus)
def get_live_water_status(db: Session = Depends(get_db)):
    status_dict = serial_service.get_status()
    tariff = db.query(TariffConfig).first()
    
    today_l, peak_lpm = analytics_service.get_today_consumption(db)
    today_cost = analytics_service.calculate_cost(today_l, tariff) if tariff else 0.0

    daily_budget = tariff.daily_target_liters if tariff else 500.0
    budget_pct = round((today_l / daily_budget) * 100.0, 1) if daily_budget > 0 else 0.0

    unresolved_alerts = db.query(Alert).filter(Alert.resolved == False).count()

    return LiveWaterStatus(
        connected=status_dict["connected"],
        is_simulated=status_dict["is_simulated"],
        port=status_dict["port"],
        baud_rate=status_dict["baud_rate"],
        last_reading_time=status_dict["last_reading_time"],
        data_freshness_seconds=status_dict["data_freshness_seconds"],
        flow_rate_lpm=status_dict["flow_rate_lpm"],
        total_liters=status_dict["total_liters"],
        pulses=status_dict["pulses"],
        today_consumption_liters=today_l,
        today_cost_inr=today_cost,
        daily_budget_liters=daily_budget,
        budget_usage_percent=budget_pct,
        sensor_status=status_dict["sensor_status"],
        recent_alert_count=unresolved_alerts
    )

@router.get("/history", response_model=List[WaterReadingOut])
def get_water_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(WaterReading)
    if start_date:
        query = query.filter(WaterReading.timestamp >= start_date)
    if end_date:
        query = query.filter(WaterReading.timestamp <= end_date)
    
    return query.order_by(WaterReading.timestamp.desc()).offset(skip).limit(limit).all()

@router.get("/recent-stream", response_model=List[WaterReadingOut])
def get_recent_stream(limit: int = Query(25, ge=5, le=100), db: Session = Depends(get_db)):
    readings = db.query(WaterReading).order_by(WaterReading.id.desc()).limit(limit).all()
    # Return chronologically ascending for convenient chart feeding
    return list(reversed(readings))
