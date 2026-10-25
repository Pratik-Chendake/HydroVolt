from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.models import Alert, DeviceConfig, WaterReading

class AlertService:
    def __init__(self):
        self._last_alert_time = {}

    def check_reading_for_alerts(self, db: Session, reading: WaterReading, config: DeviceConfig):
        now = datetime.now(timezone.utc)

        # 1. High Flow Rate Check
        high_threshold = config.flow_warning_threshold_lpm if config else 25.0
        if reading.flow_rate_lpm > high_threshold:
            self._trigger_alert_if_throttled(
                db=db,
                alert_type="HIGH_FLOW",
                severity="warning" if reading.flow_rate_lpm < high_threshold * 1.5 else "critical",
                title=f"Excessive Water Flow Detected: {reading.flow_rate_lpm:.1f} L/min",
                message=f"Flow rate peaked at {reading.flow_rate_lpm:.2f} L/min, which exceeds the configured safety threshold of {high_threshold} L/min. Possible tap left open or pipe leak.",
                flow_rate=reading.flow_rate_lpm,
                cooldown_minutes=15
            )

        # 2. Continuous Flow / Anomaly Leak Check
        leak_threshold = config.continuous_leak_threshold_lpm if config else 0.25
        leak_duration_mins = config.continuous_leak_duration_mins if config else 45
        
        # Check if flow has been continuously > leak_threshold for the duration
        window_start = now - timedelta(minutes=leak_duration_mins)
        recent_readings = (
            db.query(WaterReading)
            .filter(WaterReading.timestamp >= window_start)
            .order_by(WaterReading.timestamp.asc())
            .all()
        )

        if len(recent_readings) >= 6:
            all_flowing = all(r.flow_rate_lpm >= leak_threshold for r in recent_readings)
            if all_flowing:
                avg_leak_flow = sum(r.flow_rate_lpm for r in recent_readings) / len(recent_readings)
                self._trigger_alert_if_throttled(
                    db=db,
                    alert_type="POSSIBLE_LEAK",
                    severity="warning",
                    title="Potential Continuous Leak Detected",
                    message=f"Sustained water flow of approx {avg_leak_flow:.2f} L/min has been continuously active for over {leak_duration_mins} minutes without interruption. Check fixtures or toilet valves.",
                    flow_rate=avg_leak_flow,
                    cooldown_minutes=60
                )

    def trigger_system_alert(self, db: Session, alert_type: str, severity: str, title: str, message: str):
        self._trigger_alert_if_throttled(
            db=db,
            alert_type=alert_type,
            severity=severity,
            title=title,
            message=message,
            flow_rate=None,
            cooldown_minutes=10
        )

    def _trigger_alert_if_throttled(
        self,
        db: Session,
        alert_type: str,
        severity: str,
        title: str,
        message: str,
        flow_rate: float = None,
        cooldown_minutes: int = 15
    ):
        now = datetime.now(timezone.utc)
        last_time = self._last_alert_time.get(alert_type)
        if last_time and (now - last_time).total_seconds() < cooldown_minutes * 60:
            return

        self._last_alert_time[alert_type] = now
        new_alert = Alert(
            timestamp=now,
            alert_type=alert_type,
            severity=severity,
            title=title,
            message=message,
            flow_rate_observed=flow_rate,
            acknowledged=False,
            resolved=False
        )
        db.add(new_alert)
        db.commit()

alert_service = AlertService()
