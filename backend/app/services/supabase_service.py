import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

class SupabaseService:
    def __init__(self):
        self.url = settings.SUPABASE_URL.rstrip('/')
        self.anon_key = settings.SUPABASE_ANON_KEY
        self.service_key = settings.SUPABASE_SERVICE_ROLE_KEY
        self.enabled = settings.SUPABASE_ENABLED
        self.rest_url = f"{self.url}/rest/v1"
        self._table_missing_warned = set()

    def _get_headers(self, prefer: Optional[str] = None) -> Dict[str, str]:
        headers = {
            "apikey": self.service_key,
            "Authorization": f"Bearer {self.service_key}",
            "Content-Type": "application/json",
        }
        if prefer:
            headers["Prefer"] = prefer
        return headers

    async def check_connection(self) -> Dict[str, Any]:
        """
        Verify connection to Supabase cloud using service_role key.
        """
        if not self.enabled:
            return {
                "enabled": False,
                "connected": False,
                "message": "Supabase integration is disabled in configuration.",
            }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(f"{self.rest_url}/", headers=self._get_headers())
                if res.status_code == 200:
                    spec = res.json()
                    paths = list(spec.get("paths", {}).keys())
                    tables = [p.replace('/', '') for p in paths if p != '/']
                    return {
                        "enabled": True,
                        "connected": True,
                        "url": self.url,
                        "project_ref": "escefqdmzcqcfbgqwjil",
                        "tables_registered": tables,
                        "message": f"Connected to Supabase. {len(tables)} tables registered in public schema.",
                    }
                else:
                    return {
                        "enabled": True,
                        "connected": False,
                        "url": self.url,
                        "project_ref": "escefqdmzcqcfbgqwjil",
                        "status_code": res.status_code,
                        "message": f"Supabase responded with status {res.status_code}: {res.text}",
                    }
        except Exception as e:
            logger.warning(f"Failed to connect to Supabase: {e}")
            return {
                "enabled": True,
                "connected": False,
                "url": self.url,
                "project_ref": "escefqdmzcqcfbgqwjil",
                "message": str(e),
            }

    async def sync_reading(self, reading_data: Dict[str, Any]) -> bool:
        """
        Sync a water reading record to Supabase water_readings table.
        """
        if not self.enabled:
            return False

        payload = {
            "timestamp": reading_data.get("timestamp") or datetime.now(timezone.utc).isoformat(),
            "flow_rate_lpm": float(reading_data.get("flow_rate_lpm", 0.0)),
            "pulses": int(reading_data.get("pulses", 0)),
            "total_liters": float(reading_data.get("total_liters", 0.0)),
            "sequence_id": int(reading_data.get("sequence_id", 0)),
            "sensor_id": str(reading_data.get("sensor_id", "YF-S201")),
            "status": str(reading_data.get("status", "OK")),
            "is_simulated": bool(reading_data.get("is_simulated", False)),
        }

        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.post(
                    f"{self.rest_url}/water_readings",
                    headers=self._get_headers(prefer="return=minimal"),
                    json=payload,
                )
                if res.status_code in (200, 201):
                    return True
                elif res.status_code == 404:
                    if "water_readings" not in self._table_missing_warned:
                        logger.info("Supabase table 'water_readings' not created yet. Run supabase_schema.sql.")
                        self._table_missing_warned.add("water_readings")
                    return False
                else:
                    logger.debug(f"Supabase reading sync status {res.status_code}: {res.text}")
                    return False
        except Exception as e:
            logger.debug(f"Supabase sync reading error: {e}")
            return False

    async def sync_alert(self, alert_data: Dict[str, Any]) -> bool:
        """
        Sync or update an alert in Supabase alerts table.
        """
        if not self.enabled:
            return False

        payload = {
            "timestamp": alert_data.get("timestamp") or datetime.now(timezone.utc).isoformat(),
            "alert_type": alert_data.get("alert_type", "ANOMALY"),
            "severity": alert_data.get("severity", "warning"),
            "title": alert_data.get("title", ""),
            "message": alert_data.get("message", ""),
            "flow_rate_observed": alert_data.get("flow_rate_observed"),
            "acknowledged": bool(alert_data.get("acknowledged", False)),
            "resolved": bool(alert_data.get("resolved", False)),
        }

        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.post(
                    f"{self.rest_url}/alerts",
                    headers=self._get_headers(prefer="return=minimal"),
                    json=payload,
                )
                return res.status_code in (200, 201)
        except Exception as e:
            logger.debug(f"Supabase sync alert error: {e}")
            return False

    async def sync_tariff(self, tariff_data: Dict[str, Any]) -> bool:
        """
        Upsert tariff schedule in Supabase tariff_config table.
        """
        if not self.enabled:
            return False

        payload = {
            "id": 1,
            "tier1_limit_liters": float(tariff_data.get("tier1_limit_liters", 10000.0)),
            "tier1_rate_per_kl": float(tariff_data.get("tier1_rate_per_kl", 15.0)),
            "tier2_limit_liters": float(tariff_data.get("tier2_limit_liters", 25000.0)),
            "tier2_rate_per_kl": float(tariff_data.get("tier2_rate_per_kl", 25.0)),
            "tier3_rate_per_kl": float(tariff_data.get("tier3_rate_per_kl", 40.0)),
            "fixed_meter_charge": float(tariff_data.get("fixed_meter_charge", 50.0)),
            "sewerage_charge_percent": float(tariff_data.get("sewerage_charge_percent", 10.0)),
            "monthly_target_liters": float(tariff_data.get("monthly_target_liters", 15000.0)),
            "daily_target_liters": float(tariff_data.get("daily_target_liters", 500.0)),
            "currency": str(tariff_data.get("currency", "₹")),
        }

        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.post(
                    f"{self.rest_url}/tariff_config",
                    headers=self._get_headers(prefer="resolution=merge-duplicates"),
                    json=payload,
                )
                return res.status_code in (200, 201)
        except Exception as e:
            logger.debug(f"Supabase sync tariff error: {e}")
            return False

supabase_service = SupabaseService()
