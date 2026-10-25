import pytest
from app.models.models import TariffConfig
from app.services.analytics_service import AnalyticsService

def test_tiered_tariff_tier1_only():
    tariff = TariffConfig(
        tier1_limit_liters=10000.0,
        tier1_rate_per_kl=15.0, # Rs. 15 per kL
        tier2_limit_liters=25000.0,
        tier2_rate_per_kl=25.0,
        tier3_rate_per_kl=40.0,
        fixed_meter_charge=50.0,
        sewerage_charge_percent=10.0
    )
    # 5000 Liters = 5.0 kL.
    # Base = 5.0 * 15 = 75.0.
    # Sewerage = 75.0 * 10% = 7.5.
    # Total = 82.5.
    cost = AnalyticsService.calculate_cost(5000.0, tariff)
    assert cost == 82.5

def test_tiered_tariff_tier2_consumption():
    tariff = TariffConfig(
        tier1_limit_liters=10000.0,
        tier1_rate_per_kl=15.0,
        tier2_limit_liters=25000.0,
        tier2_rate_per_kl=25.0,
        tier3_rate_per_kl=40.0,
        fixed_meter_charge=50.0,
        sewerage_charge_percent=10.0
    )
    # 15000 Liters = 15.0 kL:
    # First 10 kL @ 15 = 150.
    # Next 5 kL @ 25 = 125.
    # Base = 275.
    # Sewerage = 27.5.
    # Total = 302.5.
    cost = AnalyticsService.calculate_cost(15000.0, tariff)
    assert cost == 302.5
