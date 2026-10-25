from unittest.mock import AsyncMock, patch
import pytest
from app.database import SessionLocal
from app.main import health_check
from app.api.v1.tariff_routes import get_tariff_config, estimate_cost
from app.api.v1.electricity_routes import get_electricity_config
from app.api.v1.water_routes import get_live_water_status
from app.api.v1.ai_routes import get_ai_insights
from app.api.v1.serial_routes import get_serial_status, start_simulation, stop_simulation
from app.api.v1.supabase_routes import get_supabase_status, sync_all_records

def test_health_check_endpoint():
    res = health_check()
    assert res["status"] == "healthy"
    assert "Smart Water & Energy Manager" in res["service"]

def test_get_tariffs_endpoint():
    with SessionLocal() as db:
        tariff = get_tariff_config(db)
        assert tariff.currency == "₹"
        assert tariff.tier1_rate_per_kl >= 0
        assert tariff.monthly_target_liters > 0

def test_estimate_cost_endpoint():
    with SessionLocal() as db:
        res = estimate_cost(volume_liters=15000.0, db=db)
        assert res["volume_liters"] == 15000.0
        assert res["volume_kl"] == 15.0
        assert res["total_estimated_inr"] > 0
        assert res["currency"] == "₹"

def test_get_electricity_endpoint():
    with SessionLocal() as db:
        config = get_electricity_config(db)
        assert config.is_enabled is False
        assert config.status == "Not configured"
        assert "not yet connected" in config.notes

def test_get_live_water_status_endpoint():
    with SessionLocal() as db:
        live = get_live_water_status(db)
        assert hasattr(live, "flow_rate_lpm")
        assert hasattr(live, "total_liters")
        assert hasattr(live, "today_consumption_liters")
        assert hasattr(live, "today_cost_inr")

def test_get_ai_insights_endpoint():
    with SessionLocal() as db:
        insights_res = get_ai_insights(db)
        assert len(insights_res.insights) > 0
        assert len(insights_res.water_conservation_tips) >= 3
        assert insights_res.forecast_next_7_days_liters > 0

def test_simulation_toggle_lifecycle():
    start_res = start_simulation()
    assert start_res["status"]["is_simulated"] is True
    assert start_res["status"]["connected"] is True

    stop_res = stop_simulation()
    assert stop_res["status"]["is_simulated"] is False

@pytest.mark.anyio
async def test_supabase_status_endpoint():
    mock_status = {
        "enabled": True,
        "connected": True,
        "url": "https://escefqdmzcqcfbgqwjil.supabase.co",
        "project_ref": "escefqdmzcqcfbgqwjil",
        "tables_registered": ["water_readings", "alerts"],
        "message": "Connected to Supabase.",
    }
    with patch("app.services.supabase_service.supabase_service.check_connection", new_callable=AsyncMock) as mock_check:
        mock_check.return_value = mock_status
        status = await get_supabase_status()
        assert status["connected"] is True
        assert status["project_ref"] == "escefqdmzcqcfbgqwjil"
        assert "https://escefqdmzcqcfbgqwjil.supabase.co" in status["url"]

@pytest.mark.anyio
async def test_supabase_sync_all_endpoint():
    with patch("app.services.supabase_service.supabase_service.sync_reading", new_callable=AsyncMock) as mock_sync_r, \
         patch("app.services.supabase_service.supabase_service.sync_alert", new_callable=AsyncMock) as mock_sync_a, \
         patch("app.services.supabase_service.supabase_service.sync_tariff", new_callable=AsyncMock) as mock_sync_t:
        mock_sync_r.return_value = True
        mock_sync_a.return_value = True
        mock_sync_t.return_value = True

        with SessionLocal() as db:
            res = await sync_all_records(db=db)
            assert res["status"] == "success"
            assert "readings_synced" in res
            assert "alerts_synced" in res
