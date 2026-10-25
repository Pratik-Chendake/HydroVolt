import csv
import io
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.models import WaterReading

class ExportService:
    @staticmethod
    def generate_csv(
        db: Session,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 5000
    ) -> str:
        query = db.query(WaterReading)
        if start_date:
            query = query.filter(WaterReading.timestamp >= start_date)
        if end_date:
            query = query.filter(WaterReading.timestamp <= end_date)

        readings: List[WaterReading] = query.order_by(WaterReading.timestamp.asc()).limit(limit).all()

        output = io.StringIO()
        writer = csv.writer(output)

        # File header with metadata
        writer.writerow(["# Smart Water & Energy Manager - Telemetry Export"])
        writer.writerow(["# Export Timestamp (UTC)", datetime.now(timezone.utc).isoformat()])
        writer.writerow(["# Total Records", len(readings)])
        writer.writerow([]) # Empty row

        # Columns
        writer.writerow([
            "Record_ID",
            "Timestamp_UTC",
            "Flow_Rate_LPM",
            "Pulses_Counted",
            "Cumulative_Volume_Liters",
            "Sequence_ID",
            "Sensor_Model",
            "Status",
            "Is_Simulated"
        ])

        for r in readings:
            writer.writerow([
                r.id,
                r.timestamp.isoformat() if r.timestamp else "",
                f"{r.flow_rate_lpm:.3f}",
                r.pulses,
                f"{r.total_liters:.3f}",
                r.sequence_id,
                r.sensor_id,
                r.status,
                "YES" if r.is_simulated else "NO"
            ])

        return output.getvalue()

export_service = ExportService()
