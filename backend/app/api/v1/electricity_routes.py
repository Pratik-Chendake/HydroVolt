from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import ElectricityConfig
from app.schemas.schemas import ElectricityConfigOut, ElectricityConfigUpdate

router = APIRouter(prefix="/electricity", tags=["Electricity Meter Integration"])

@router.get("", response_model=ElectricityConfigOut)
def get_electricity_config(db: Session = Depends(get_db)):
    config = db.query(ElectricityConfig).first()
    if not config:
        config = ElectricityConfig()
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.put("", response_model=ElectricityConfigOut)
def update_electricity_config(update_data: ElectricityConfigUpdate, db: Session = Depends(get_db)):
    config = db.query(ElectricityConfig).first()
    if not config:
        config = ElectricityConfig()
        db.add(config)

    for field, val in update_data.model_dump(exclude_unset=True).items():
        setattr(config, field, val)

    # If user enabled it but provided no model, keep honest status
    if config.is_enabled and not config.meter_model.strip():
        config.status = "Pending Hardware Specification"
    elif config.is_enabled:
        config.status = "Awaiting Driver & Physical Wiring"
    else:
        config.status = "Not configured"

    db.commit()
    db.refresh(config)
    return config
