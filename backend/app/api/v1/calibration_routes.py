from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

from app.database import get_db
from app.models.models import DeviceConfig, CalibrationRecord
from app.schemas.schemas import CalibrationRequest, CalibrationRecordOut

router = APIRouter(prefix="/calibration", tags=["Sensor Calibration"])

@router.get("/current")
def get_current_calibration(db: Session = Depends(get_db)):
    config = db.query(DeviceConfig).first()
    if not config:
        config = DeviceConfig()
        db.add(config)
        db.commit()
        db.refresh(config)

    return {
        "sensor_model": config.sensor_model,
        "sensor_pin": config.sensor_pin,
        "calibration_factor": config.calibration_factor, # pulses per liter
        "standard_yf_s201_nominal": 450.0,
        "formula_description": "Liters = Total Pulses / Calibration Factor (k). Nominal YF-S201: F = 7.5 * Q (Q in L/min, F in Hz) => ~450 pulses/L."
    }

@router.post("/calculate")
def calculate_calibration_factor(req: CalibrationRequest):
    if req.test_volume_liters <= 0:
        raise HTTPException(status_code=400, detail="Test volume must be greater than 0 Liters.")
    if req.pulses_recorded <= 0:
        raise HTTPException(status_code=400, detail="Pulses recorded must be greater than 0.")

    # k = pulses / volume
    new_k = req.pulses_recorded / req.test_volume_liters
    variance_pct = round(((new_k - 450.0) / 450.0) * 100.0, 1)

    return {
        "test_volume_liters": req.test_volume_liters,
        "pulses_recorded": req.pulses_recorded,
        "calculated_k_factor": round(new_k, 2),
        "nominal_k_factor": 450.0,
        "variance_percent_from_nominal": variance_pct,
        "status": "VALID" if 200.0 <= new_k <= 900.0 else "OUT_OF_BOUNDS_WARNING"
    }

@router.post("/apply", response_model=CalibrationRecordOut)
def apply_calibration(req: CalibrationRequest, db: Session = Depends(get_db)):
    if req.test_volume_liters <= 0 or req.pulses_recorded <= 0:
        raise HTTPException(status_code=400, detail="Volume and pulses must be positive numbers.")

    config = db.query(DeviceConfig).first()
    if not config:
        config = DeviceConfig()
        db.add(config)
        db.commit()
        db.refresh(config)

    previous_k = config.calibration_factor
    new_k = round(req.pulses_recorded / req.test_volume_liters, 2)

    # Save to history
    record = CalibrationRecord(
        timestamp=datetime.now(timezone.utc),
        sensor_model=req.sensor_model,
        sensor_pin=req.sensor_pin,
        test_volume_liters=req.test_volume_liters,
        pulses_recorded=req.pulses_recorded,
        calculated_k_factor=new_k,
        previous_k_factor=previous_k,
        applied=req.apply_immediately,
        notes=req.notes or f"Calibrated with {req.test_volume_liters}L test container."
    )
    db.add(record)

    if req.apply_immediately:
        config.calibration_factor = new_k
        config.sensor_model = req.sensor_model
        config.sensor_pin = req.sensor_pin

    db.commit()
    db.refresh(record)
    return record

@router.get("/history", response_model=List[CalibrationRecordOut])
def get_calibration_history(db: Session = Depends(get_db)):
    return db.query(CalibrationRecord).order_by(CalibrationRecord.timestamp.desc()).all()
