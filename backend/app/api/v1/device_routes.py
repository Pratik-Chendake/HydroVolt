from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import DeviceConfig
from app.schemas.schemas import DeviceConfigOut, DeviceConfigUpdate

router = APIRouter(prefix="/device", tags=["Device Management"])

@router.get("", response_model=DeviceConfigOut)
def get_device_config(db: Session = Depends(get_db)):
    config = db.query(DeviceConfig).first()
    if not config:
        config = DeviceConfig()
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.put("", response_model=DeviceConfigOut)
def update_device_config(update_data: DeviceConfigUpdate, db: Session = Depends(get_db)):
    config = db.query(DeviceConfig).first()
    if not config:
        config = DeviceConfig()
        db.add(config)

    for field, val in update_data.model_dump(exclude_unset=True).items():
        setattr(config, field, val)

    db.commit()
    db.refresh(config)
    return config
