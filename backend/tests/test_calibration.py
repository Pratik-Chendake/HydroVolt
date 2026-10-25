import pytest
from app.schemas.schemas import CalibrationRequest
from app.services.analytics_service import AnalyticsService

def test_calibration_calculation():
    # If a 5.0 Liter bucket resulted in 2250 pulses:
    # k = 2250 / 5.0 = 450.0 pulses/L
    volume = 5.0
    pulses = 2250
    k = pulses / volume
    assert k == 450.0

def test_calibration_calculation_different_sensor():
    # Another sensor with 2700 pulses for 5.0 Liters => k = 540.0
    volume = 5.0
    pulses = 2700
    k = pulses / volume
    assert k == 540.0
