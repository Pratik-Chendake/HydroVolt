from datetime import datetime, date, timedelta, timezone
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import WaterReading, DailySummary, TariffConfig, Alert
from app.schemas.schemas import HourlyPoint, DailyPoint, AnalyticsSummaryOut

class AnalyticsService:
    @staticmethod
    def calculate_cost(liters: float, tariff: TariffConfig) -> float:
        if not tariff or liters <= 0:
            return 0.0

        kl = liters / 1000.0
        tier1_kl = tariff.tier1_limit_liters / 1000.0
        tier2_kl = tariff.tier2_limit_liters / 1000.0

        base_cost = 0.0
        if kl <= tier1_kl:
            base_cost = kl * tariff.tier1_rate_per_kl
        elif kl <= tier2_kl:
            base_cost = (tier1_kl * tariff.tier1_rate_per_kl) + ((kl - tier1_kl) * tariff.tier2_rate_per_kl)
        else:
            base_cost = (
                (tier1_kl * tariff.tier1_rate_per_kl) +
                ((tier2_kl - tier1_kl) * tariff.tier2_rate_per_kl) +
                ((kl - tier2_kl) * tariff.tier3_rate_per_kl)
            )

        sewerage = base_cost * (tariff.sewerage_charge_percent / 100.0)
        total = base_cost + sewerage
        return round(total, 2)

    @staticmethod
    def get_today_consumption(db: Session) -> Tuple[float, float]:
        now = datetime.now(timezone.utc)
        start_of_today = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
        
        # We can calculate consumption either by delta of total_liters or sum of interval flow
        readings = (
            db.query(WaterReading)
            .filter(WaterReading.timestamp >= start_of_today)
            .order_by(WaterReading.timestamp.asc())
            .all()
        )
        if not readings:
            return 0.0, 0.0

        if len(readings) == 1:
            total_l = readings[0].pulses / 450.0 # fallback approx
            peak_lpm = readings[0].flow_rate_lpm
            return round(total_l, 2), peak_lpm

        # Total today = max(total_liters) - min(total_liters)
        total_l = max(0.0, readings[-1].total_liters - readings[0].total_liters)
        peak_lpm = max(r.flow_rate_lpm for r in readings)
        return round(total_l, 2), round(peak_lpm, 2)

    @staticmethod
    def get_analytics_summary(db: Session, tariff: TariffConfig) -> AnalyticsSummaryOut:
        now = datetime.now(timezone.utc)
        today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
        yesterday_start = today_start - timedelta(days=1)

        # Today's readings
        today_readings = (
            db.query(WaterReading)
            .filter(WaterReading.timestamp >= today_start)
            .order_by(WaterReading.timestamp.asc())
            .all()
        )
        today_l = 0.0
        peak_lpm = 0.0
        if today_readings:
            today_l = max(0.0, today_readings[-1].total_liters - today_readings[0].total_liters)
            peak_lpm = max(r.flow_rate_lpm for r in today_readings)

        # Yesterday's readings
        yesterday_readings = (
            db.query(WaterReading)
            .filter(WaterReading.timestamp >= yesterday_start, WaterReading.timestamp < today_start)
            .order_by(WaterReading.timestamp.asc())
            .all()
        )
        yesterday_l = 0.0
        if yesterday_readings:
            yesterday_l = max(0.0, yesterday_readings[-1].total_liters - yesterday_readings[0].total_liters)

        change_pct = 0.0
        if yesterday_l > 0:
            change_pct = round(((today_l - yesterday_l) / yesterday_l) * 100, 1)

        # Hourly breakdown for today
        hourly_data: List[HourlyPoint] = []
        hour_buckets: Dict[int, List[WaterReading]] = {h: [] for h in range(24)}
        for r in today_readings:
            hour_buckets[r.timestamp.hour].append(r)

        peak_hour_idx = 0
        max_hour_liters = 0.0

        for h in range(24):
            bucket = hour_buckets[h]
            h_liters = 0.0
            h_peak = 0.0
            if bucket:
                h_liters = max(0.0, bucket[-1].total_liters - bucket[0].total_liters)
                # If only 1 reading or delta is 0, estimate from pulses
                if h_liters == 0:
                    h_liters = sum(x.pulses for x in bucket) / 450.0
                h_peak = max(x.flow_rate_lpm for x in bucket)

            if h_liters > max_hour_liters:
                max_hour_liters = h_liters
                peak_hour_idx = h

            h_cost = AnalyticsService.calculate_cost(h_liters, tariff)
            label = f"{h:02d}:00"
            hourly_data.append(HourlyPoint(
                hour=h,
                label=label,
                liters=round(h_liters, 2),
                cost_inr=h_cost,
                peak_lpm=round(h_peak, 2)
            ))

        # Daily breakdown for last 7 days
        daily_data: List[DailyPoint] = []
        last_7_days_total = 0.0
        for i in range(6, -1, -1):
            d_start = today_start - timedelta(days=i)
            d_end = d_start + timedelta(days=1)
            d_readings = (
                db.query(WaterReading)
                .filter(WaterReading.timestamp >= d_start, WaterReading.timestamp < d_end)
                .order_by(WaterReading.timestamp.asc())
                .all()
            )
            d_liters = 0.0
            d_peak = 0.0
            if d_readings:
                d_liters = max(0.0, d_readings[-1].total_liters - d_readings[0].total_liters)
                d_peak = max(x.flow_rate_lpm for x in d_readings)

            daily_data.append(DailyPoint(
                date=d_start.strftime("%b %d"),
                liters=round(d_liters, 1),
                cost_inr=AnalyticsService.calculate_cost(d_liters, tariff),
                peak_lpm=round(d_peak, 1)
            ))
            last_7_days_total += d_liters

        # 30-day calculation
        d30_start = today_start - timedelta(days=30)
        d30_readings = (
            db.query(WaterReading)
            .filter(WaterReading.timestamp >= d30_start)
            .order_by(WaterReading.timestamp.asc())
            .all()
        )
        last_30_days_total = 0.0
        if d30_readings:
            last_30_days_total = max(0.0, d30_readings[-1].total_liters - d30_readings[0].total_liters)
        if last_30_days_total < last_7_days_total:
            last_30_days_total = last_7_days_total

        daily_avg = round(last_7_days_total / 7.0, 1) if last_7_days_total > 0 else today_l
        projected_month = round(daily_avg * 30.0, 1)
        estimated_bill = AnalyticsService.calculate_cost(projected_month, tariff) + (tariff.fixed_meter_charge if tariff else 50.0)

        # Anomaly count
        anomaly_count = db.query(Alert).filter(Alert.resolved == False).count()

        return AnalyticsSummaryOut(
            today_total_l=round(today_l, 2),
            yesterday_total_l=round(yesterday_l, 2),
            change_percent_vs_yesterday=change_pct,
            last_7_days_total_l=round(last_7_days_total, 1),
            last_30_days_total_l=round(last_30_days_total, 1),
            daily_average_l=daily_avg,
            projected_month_l=projected_month,
            estimated_bill_inr=round(estimated_bill, 2),
            peak_usage_hour=f"{peak_hour_idx:02d}:00 - {(peak_hour_idx+1)%24:02d}:00",
            peak_flow_rate_lpm=round(peak_lpm, 2),
            potential_anomalies_count=anomaly_count,
            hourly_trends=hourly_data,
            daily_trends=daily_data
        )

analytics_service = AnalyticsService()
