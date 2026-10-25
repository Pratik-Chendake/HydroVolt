from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.database import get_db
from app.models.models import Alert
from app.schemas.schemas import AlertOut, AlertUpdate

router = APIRouter(prefix="/alerts", tags=["Alerts & Events"])

@router.get("", response_model=List[AlertOut])
def list_alerts(
    resolved: Optional[bool] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(Alert)
    if resolved is not None:
        query = query.filter(Alert.resolved == resolved)
    return query.order_by(Alert.timestamp.desc()).limit(limit).all()

@router.patch("/{alert_id}", response_model=AlertOut)
def update_alert(alert_id: int, update_data: AlertUpdate, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if update_data.acknowledged is not None:
        alert.acknowledged = update_data.acknowledged
    if update_data.resolved is not None:
        alert.resolved = update_data.resolved

    db.commit()
    db.refresh(alert)
    return alert

@router.post("/test-trigger", response_model=AlertOut)
def trigger_test_alert(db: Session = Depends(get_db)):
    test_alert = Alert(
        timestamp=datetime.now(timezone.utc),
        alert_type="HIGH_FLOW",
        severity="warning",
        title="Diagnostic Water Surge Warning",
        message="Manual diagnostic test: Simulated tap flow exceeded 28.5 L/min for 60 seconds.",
        flow_rate_observed=28.5,
        acknowledged=False,
        resolved=False
    )
    db.add(test_alert)
    db.commit()
    db.refresh(test_alert)
    return test_alert
