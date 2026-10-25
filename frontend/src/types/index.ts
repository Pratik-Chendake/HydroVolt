export interface LiveWaterStatus {
  connected: boolean;
  is_simulated: boolean;
  port: string;
  baud_rate: number;
  last_reading_time: string | null;
  data_freshness_seconds: number | null;
  flow_rate_lpm: number;
  total_liters: number;
  pulses: number;
  today_consumption_liters: number;
  today_cost_inr: number;
  daily_budget_liters: number;
  budget_usage_percent: number;
  sensor_status: string;
  recent_alert_count: number;
}

export interface WaterReading {
  id: number;
  timestamp: string;
  flow_rate_lpm: number;
  pulses: number;
  total_liters: number;
  sequence_id: number;
  sensor_id: string;
  status: string;
  is_simulated: boolean;
}

export interface SerialPortInfo {
  port: string;
  description: string;
  hwid: string;
}

export interface CalibrationInfo {
  sensor_model: string;
  sensor_pin: string;
  calibration_factor: number;
  standard_yf_s201_nominal: number;
  formula_description: string;
}

export interface CalibrationCalculation {
  test_volume_liters: number;
  pulses_recorded: number;
  calculated_k_factor: number;
  nominal_k_factor: number;
  variance_percent_from_nominal: number;
  status: string;
}

export interface CalibrationRecord {
  id: number;
  timestamp: string;
  sensor_model: string;
  sensor_pin: string;
  test_volume_liters: number;
  pulses_recorded: number;
  calculated_k_factor: number;
  previous_k_factor: number;
  applied: boolean;
  notes: string | null;
}

export interface TariffConfig {
  id: number;
  tier1_limit_liters: number;
  tier1_rate_per_kl: number;
  tier2_limit_liters: number;
  tier2_rate_per_kl: number;
  tier3_rate_per_kl: number;
  fixed_meter_charge: number;
  sewerage_charge_percent: number;
  monthly_target_liters: number;
  daily_target_liters: number;
  currency: string;
}

export interface DeviceConfig {
  id: number;
  serial_port: string;
  baud_rate: number;
  auto_reconnect: boolean;
  reconnect_interval_sec: number;
  sensor_model: string;
  sensor_pin: string;
  calibration_factor: number;
  flow_warning_threshold_lpm: number;
  continuous_leak_threshold_lpm: number;
  continuous_leak_duration_mins: number;
}

export interface ElectricityConfig {
  id: number;
  is_enabled: boolean;
  meter_model: string;
  interface_type: string;
  baud_rate: number;
  parity: string;
  slave_address: number;
  status: string;
  notes: string;
}

export interface Alert {
  id: number;
  timestamp: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  flow_rate_observed?: number;
  acknowledged: boolean;
  resolved: boolean;
}

export interface HourlyPoint {
  hour: number;
  label: string;
  liters: number;
  cost_inr: number;
  peak_lpm: number;
}

export interface DailyPoint {
  date: string;
  liters: number;
  cost_inr: number;
  peak_lpm: number;
}

export interface AnalyticsSummary {
  today_total_l: number;
  yesterday_total_l: number;
  change_percent_vs_yesterday: number;
  last_7_days_total_l: number;
  last_30_days_total_l: number;
  daily_average_l: number;
  projected_month_l: number;
  estimated_bill_inr: number;
  peak_usage_hour: string;
  peak_flow_rate_lpm: number;
  potential_anomalies_count: number;
  hourly_trends: HourlyPoint[];
  daily_trends: DailyPoint[];
}

export interface AIInsightItem {
  id: string;
  type: 'ANOMALY' | 'OPTIMIZATION' | 'FORECAST' | 'PATTERN';
  severity: 'info' | 'warning' | 'success';
  title: string;
  description: string;
  evidence: string;
  time_window: string;
  recommendation: string;
  confidence: number;
}

export interface AIInsightsResponse {
  generated_at: string;
  total_data_points_analyzed: number;
  time_range_evaluated: string;
  status: string;
  insights: AIInsightItem[];
  water_conservation_tips: string[];
  forecast_next_7_days_liters: number;
}
