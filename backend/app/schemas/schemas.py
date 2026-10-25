from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, date

class WaterReadingCreate(BaseModel):
    seq: int
    sensor: str = "YF-S201"
    flow_lpm: float
    pulses: int
    total_l: float
    status: str = "OK"

class WaterReadingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    timestamp: datetime
    flow_rate_lpm: float
    pulses: int
    total_liters: float
    sequence_id: int
    sensor_id: str
    status: str
    is_simulated: bool

class LiveWaterStatus(BaseModel):
    connected: bool
    is_simulated: bool
    port: str
    baud_rate: int
    last_reading_time: Optional[datetime] = None
    data_freshness_seconds: Optional[float] = None
    flow_rate_lpm: float = 0.0
    total_liters: float = 0.0
    pulses: int = 0
    today_consumption_liters: float = 0.0
    today_cost_inr: float = 0.0
    daily_budget_liters: float = 500.0
    budget_usage_percent: float = 0.0
    sensor_status: str = "OFFLINE"
    recent_alert_count: int = 0

class SerialPortInfo(BaseModel):
    port: str
    description: str
    hwid: str

class SerialConnectRequest(BaseModel):
    port: str
    baud_rate: int = 9600

class CalibrationRequest(BaseModel):
    test_volume_liters: float = Field(..., gt=0, description="Actual measured volume in Liters")
    pulses_recorded: int = Field(..., gt=0, description="Total pulses counted during test")
    sensor_model: str = "YF-S201"
    sensor_pin: str = "D2"
    apply_immediately: bool = True
    notes: Optional[str] = None

class CalibrationRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    timestamp: datetime
    sensor_model: str
    sensor_pin: str
    test_volume_liters: float
    pulses_recorded: int
    calculated_k_factor: float
    previous_k_factor: float
    applied: bool
    notes: Optional[str]

class TariffConfigOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tier1_limit_liters: float
    tier1_rate_per_kl: float
    tier2_limit_liters: float
    tier2_rate_per_kl: float
    tier3_rate_per_kl: float
    fixed_meter_charge: float
    sewerage_charge_percent: float
    monthly_target_liters: float
    daily_target_liters: float
    currency: str

class TariffConfigUpdate(BaseModel):
    tier1_limit_liters: Optional[float] = None
    tier1_rate_per_kl: Optional[float] = None
    tier2_limit_liters: Optional[float] = None
    tier2_rate_per_kl: Optional[float] = None
    tier3_rate_per_kl: Optional[float] = None
    fixed_meter_charge: Optional[float] = None
    sewerage_charge_percent: Optional[float] = None
    monthly_target_liters: Optional[float] = None
    daily_target_liters: Optional[float] = None

class DeviceConfigOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    serial_port: str
    baud_rate: int
    auto_reconnect: bool
    reconnect_interval_sec: int
    sensor_model: str
    sensor_pin: str
    calibration_factor: float
    flow_warning_threshold_lpm: float
    continuous_leak_threshold_lpm: float
    continuous_leak_duration_mins: int

class DeviceConfigUpdate(BaseModel):
    serial_port: Optional[str] = None
    baud_rate: Optional[int] = None
    auto_reconnect: Optional[bool] = None
    reconnect_interval_sec: Optional[int] = None
    sensor_model: Optional[str] = None
    sensor_pin: Optional[str] = None
    calibration_factor: Optional[float] = None
    flow_warning_threshold_lpm: Optional[float] = None
    continuous_leak_threshold_lpm: Optional[float] = None
    continuous_leak_duration_mins: Optional[int] = None

class ElectricityConfigOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_enabled: bool
    meter_model: str
    interface_type: str
    baud_rate: int
    parity: str
    slave_address: int
    status: str
    notes: str

class ElectricityConfigUpdate(BaseModel):
    is_enabled: Optional[bool] = None
    meter_model: Optional[str] = None
    interface_type: Optional[str] = None
    baud_rate: Optional[int] = None
    parity: Optional[str] = None
    slave_address: Optional[int] = None
    notes: Optional[str] = None

class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    timestamp: datetime
    alert_type: str
    severity: str
    title: str
    message: str
    flow_rate_observed: Optional[float] = None
    acknowledged: bool
    resolved: bool

class AlertUpdate(BaseModel):
    acknowledged: Optional[bool] = None
    resolved: Optional[bool] = None

class HourlyPoint(BaseModel):
    hour: int
    label: str
    liters: float
    cost_inr: float
    peak_lpm: float

class DailyPoint(BaseModel):
    date: str
    liters: float
    cost_inr: float
    peak_lpm: float

class AnalyticsSummaryOut(BaseModel):
    today_total_l: float
    yesterday_total_l: float
    change_percent_vs_yesterday: float
    last_7_days_total_l: float
    last_30_days_total_l: float
    daily_average_l: float
    projected_month_l: float
    estimated_bill_inr: float
    peak_usage_hour: str
    peak_flow_rate_lpm: float
    potential_anomalies_count: int
    hourly_trends: List[HourlyPoint]
    daily_trends: List[DailyPoint]

class AIInsightItem(BaseModel):
    id: str
    type: str # ANOMALY, OPTIMIZATION, FORECAST, PATTERN
    severity: str # info, warning, success
    title: str
    description: str
    evidence: str
    time_window: str
    recommendation: str
    confidence: float # 0.0 - 1.0

class AIInsightsResponse(BaseModel):
    generated_at: datetime
    total_data_points_analyzed: int
    time_range_evaluated: str
    status: str
    insights: List[AIInsightItem]
    water_conservation_tips: List[str]
    forecast_next_7_days_liters: float
