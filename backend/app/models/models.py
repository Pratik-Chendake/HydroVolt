from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, Date, Text
from app.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class WaterReading(Base):
    __tablename__ = "water_readings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime(timezone=True), default=utcnow, index=True)
    flow_rate_lpm = Column(Float, nullable=False, default=0.0)
    pulses = Column(Integer, nullable=False, default=0)
    total_liters = Column(Float, nullable=False, default=0.0)
    sequence_id = Column(Integer, nullable=False, default=0)
    sensor_id = Column(String(50), default="YF-S201")
    status = Column(String(20), default="OK")
    is_simulated = Column(Boolean, default=False)

class DailySummary(Base):
    __tablename__ = "daily_summaries"

    date = Column(Date, primary_key=True, index=True)
    total_liters = Column(Float, default=0.0)
    peak_flow_lpm = Column(Float, default=0.0)
    peak_hour = Column(Integer, default=0)
    estimated_cost_inr = Column(Float, default=0.0)
    readings_count = Column(Integer, default=0)

class CalibrationRecord(Base):
    __tablename__ = "calibration_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime(timezone=True), default=utcnow)
    sensor_model = Column(String(50), default="YF-S201")
    sensor_pin = Column(String(20), default="D2")
    test_volume_liters = Column(Float, nullable=False)
    pulses_recorded = Column(Integer, nullable=False)
    calculated_k_factor = Column(Float, nullable=False)
    previous_k_factor = Column(Float, nullable=False)
    applied = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime(timezone=True), default=utcnow, index=True)
    alert_type = Column(String(50), nullable=False) # HIGH_FLOW, POSSIBLE_LEAK, SENSOR_OFFLINE, BUDGET_EXCEEDED
    severity = Column(String(20), default="warning") # info, warning, critical
    title = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    flow_rate_observed = Column(Float, nullable=True)
    acknowledged = Column(Boolean, default=False)
    resolved = Column(Boolean, default=False)

class TariffConfig(Base):
    __tablename__ = "tariff_config"

    id = Column(Integer, primary_key=True, default=1)
    tier1_limit_liters = Column(Float, default=10000.0)
    tier1_rate_per_kl = Column(Float, default=15.0)
    tier2_limit_liters = Column(Float, default=25000.0)
    tier2_rate_per_kl = Column(Float, default=25.0)
    tier3_rate_per_kl = Column(Float, default=40.0)
    fixed_meter_charge = Column(Float, default=50.0)
    sewerage_charge_percent = Column(Float, default=10.0)
    monthly_target_liters = Column(Float, default=15000.0)
    daily_target_liters = Column(Float, default=500.0)
    currency = Column(String(10), default="₹")

class DeviceConfig(Base):
    __tablename__ = "device_config"

    id = Column(Integer, primary_key=True, default=1)
    serial_port = Column(String(50), default="COM3")
    baud_rate = Column(Integer, default=9600)
    auto_reconnect = Column(Boolean, default=True)
    reconnect_interval_sec = Column(Integer, default=5)
    sensor_model = Column(String(50), default="YF-S201 (Hall Effect)")
    sensor_pin = Column(String(20), default="Pin D2 (Interrupt 0)")
    calibration_factor = Column(Float, default=450.0) # pulses per liter
    flow_warning_threshold_lpm = Column(Float, default=25.0)
    continuous_leak_threshold_lpm = Column(Float, default=0.25)
    continuous_leak_duration_mins = Column(Integer, default=45)

class ElectricityConfig(Base):
    __tablename__ = "electricity_config"

    id = Column(Integer, primary_key=True, default=1)
    is_enabled = Column(Boolean, default=False)
    meter_model = Column(String(100), default="")
    interface_type = Column(String(50), default="RS485 / Modbus RTU")
    baud_rate = Column(Integer, default=9600)
    parity = Column(String(20), default="None")
    slave_address = Column(Integer, default=1)
    status = Column(String(50), default="Not configured")
    notes = Column(Text, default="Hardware electricity meter is not yet connected. Water monitoring remains completely functional independently.")
