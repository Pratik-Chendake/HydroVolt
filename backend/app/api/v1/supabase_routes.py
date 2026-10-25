import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.supabase_service import supabase_service
from app.models.models import WaterReading, Alert, TariffConfig, DeviceConfig

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/supabase", tags=["Supabase Cloud"])

@router.get("/status")
async def get_supabase_status():
    """
    Check connection and schema state with Supabase cloud.
    """
    return await supabase_service.check_connection()

@router.post("/sync-all")
async def sync_all_records(db: Session = Depends(get_db)):
    """
    Reconcile and upload local SQLite records to Supabase cloud database.
    """
    readings = db.query(WaterReading).order_by(WaterReading.id.desc()).limit(100).all()
    alerts = db.query(Alert).all()
    tariff = db.query(TariffConfig).first()

    synced_readings = 0
    for r in reversed(readings):
        ok = await supabase_service.sync_reading({
            "timestamp": r.timestamp.isoformat() if r.timestamp else None,
            "flow_rate_lpm": r.flow_rate_lpm,
            "pulses": r.pulses,
            "total_liters": r.total_liters,
            "sequence_id": r.sequence_id,
            "sensor_id": r.sensor_id,
            "status": r.status,
            "is_simulated": r.is_simulated
        })
        if ok:
            synced_readings += 1

    synced_alerts = 0
    for a in alerts:
        ok = await supabase_service.sync_alert({
            "timestamp": a.timestamp.isoformat() if a.timestamp else None,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "title": a.title,
            "message": a.message,
            "flow_rate_observed": a.flow_rate_observed,
            "acknowledged": a.acknowledged,
            "resolved": a.resolved
        })
        if ok:
            synced_alerts += 1

    if tariff:
        await supabase_service.sync_tariff({
            "tier1_limit_liters": tariff.tier1_limit_liters,
            "tier1_rate_per_kl": tariff.tier1_rate_per_kl,
            "tier2_limit_liters": tariff.tier2_limit_liters,
            "tier2_rate_per_kl": tariff.tier2_rate_per_kl,
            "tier3_rate_per_kl": tariff.tier3_rate_per_kl,
            "fixed_meter_charge": tariff.fixed_meter_charge,
            "sewerage_charge_percent": tariff.sewerage_charge_percent,
            "monthly_target_liters": tariff.monthly_target_liters,
            "daily_target_liters": tariff.daily_target_liters,
            "currency": tariff.currency
        })

    return {
        "status": "success",
        "readings_synced": synced_readings,
        "alerts_synced": synced_alerts,
        "message": f"Synchronized {synced_readings} telemetry packets and {synced_alerts} alerts to Supabase cloud."
    }
