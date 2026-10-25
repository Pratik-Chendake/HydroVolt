from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import TariffConfig
from app.schemas.schemas import TariffConfigOut, TariffConfigUpdate
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/tariffs", tags=["Tariffs & Billing"])

@router.get("", response_model=TariffConfigOut)
def get_tariff_config(db: Session = Depends(get_db)):
    tariff = db.query(TariffConfig).first()
    if not tariff:
        tariff = TariffConfig()
        db.add(tariff)
        db.commit()
        db.refresh(tariff)
    return tariff

@router.put("", response_model=TariffConfigOut)
def update_tariff_config(update_data: TariffConfigUpdate, db: Session = Depends(get_db)):
    tariff = db.query(TariffConfig).first()
    if not tariff:
        tariff = TariffConfig()
        db.add(tariff)

    for field, val in update_data.model_dump(exclude_unset=True).items():
        setattr(tariff, field, val)

    db.commit()
    db.refresh(tariff)
    return tariff

@router.get("/estimate")
def estimate_cost(volume_liters: float = Query(..., ge=0), db: Session = Depends(get_db)):
    tariff = db.query(TariffConfig).first()
    cost = analytics_service.calculate_cost(volume_liters, tariff) if tariff else 0.0
    fixed = tariff.fixed_meter_charge if tariff else 50.0
    total = cost + fixed

    return {
        "volume_liters": volume_liters,
        "volume_kl": round(volume_liters / 1000.0, 3),
        "volumetric_cost_inr": cost,
        "fixed_charge_inr": fixed,
        "total_estimated_inr": round(total, 2),
        "currency": "₹"
    }
