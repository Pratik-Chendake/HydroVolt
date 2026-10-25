from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.database import get_db
from app.services.export_service import export_service
from app.services.analytics_service import analytics_service
from app.models.models import TariffConfig

router = APIRouter(prefix="/reports", tags=["Reports & Exports"])

@router.get("/csv")
def download_water_csv(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(5000, ge=10, le=20000),
    db: Session = Depends(get_db)
):
    csv_content = export_service.generate_csv(db, start_date=start_date, end_date=end_date, limit=limit)
    filename = f"hydovolt_water_telemetry_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Cache-Control": "no-cache"
        }
    )

@router.get("/summary")
def get_printable_summary(db: Session = Depends(get_db)):
    tariff = db.query(TariffConfig).first()
    summary = analytics_service.get_analytics_summary(db, tariff)
    return {
        "report_generated_at": datetime.now().isoformat(),
        "today_total_liters": summary.today_total_l,
        "last_7_days_total_liters": summary.last_7_days_total_l,
        "daily_average_liters": summary.daily_average_l,
        "projected_monthly_bill_inr": summary.estimated_bill_inr,
        "currency": "₹"
    }
