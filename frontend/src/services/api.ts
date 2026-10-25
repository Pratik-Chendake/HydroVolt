import {
  LiveWaterStatus,
  WaterReading,
  SerialPortInfo,
  CalibrationInfo,
  CalibrationCalculation,
  CalibrationRecord,
  TariffConfig,
  DeviceConfig,
  ElectricityConfig,
  Alert,
  AnalyticsSummary,
  AIInsightsResponse
} from '../types';

const API_BASE = '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errMsg = `Request failed (${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson.detail) errMsg = errJson.detail;
    } catch {}
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Water
  getLiveWaterStatus: () => request<LiveWaterStatus>('/water/live'),
  getWaterHistory: (params: { skip?: number; limit?: number; start_date?: string; end_date?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.skip !== undefined) qs.set('skip', params.skip.toString());
    if (params.limit !== undefined) qs.set('limit', params.limit.toString());
    if (params.start_date) qs.set('start_date', params.start_date);
    if (params.end_date) qs.set('end_date', params.end_date);
    return request<WaterReading[]>(`/water/history?${qs.toString()}`);
  },
  getRecentStream: (limit = 25) => request<WaterReading[]>(`/water/recent-stream?limit=${limit}`),

  // Serial
  getSerialPorts: () => request<SerialPortInfo[]>('/serial/ports'),
  getSerialStatus: () => request<any>('/serial/status'),
  connectSerial: (port: string, baud_rate: number) =>
    request<{ message: string; status: any }>('/serial/connect', {
      method: 'POST',
      body: JSON.stringify({ port, baud_rate }),
    }),
  disconnectSerial: () =>
    request<{ message: string; status: any }>('/serial/disconnect', { method: 'POST' }),
  startSimulation: () =>
    request<{ message: string; status: any }>('/serial/simulate/start', { method: 'POST' }),
  stopSimulation: () =>
    request<{ message: string; status: any }>('/serial/simulate/stop', { method: 'POST' }),

  // Calibration
  getCurrentCalibration: () => request<CalibrationInfo>('/calibration/current'),
  calculateCalibration: (test_volume_liters: number, pulses_recorded: number) =>
    request<CalibrationCalculation>('/calibration/calculate', {
      method: 'POST',
      body: JSON.stringify({ test_volume_liters, pulses_recorded }),
    }),
  applyCalibration: (data: {
    test_volume_liters: number;
    pulses_recorded: number;
    sensor_model?: string;
    sensor_pin?: string;
    apply_immediately?: boolean;
    notes?: string;
  }) =>
    request<CalibrationRecord>('/calibration/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getCalibrationHistory: () => request<CalibrationRecord[]>('/calibration/history'),

  // Tariffs & Billing
  getTariffs: () => request<TariffConfig>('/tariffs'),
  updateTariffs: (data: Partial<TariffConfig>) =>
    request<TariffConfig>('/tariffs', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  estimateCost: (volume_liters: number) =>
    request<{
      volume_liters: number;
      volume_kl: number;
      volumetric_cost_inr: number;
      fixed_charge_inr: number;
      total_estimated_inr: number;
      currency: string;
    }>(`/tariffs/estimate?volume_liters=${volume_liters}`),

  // Alerts
  getAlerts: (resolved?: boolean, limit = 50) => {
    const qs = new URLSearchParams({ limit: limit.toString() });
    if (resolved !== undefined) qs.set('resolved', resolved.toString());
    return request<Alert[]>(`/alerts?${qs.toString()}`);
  },
  updateAlert: (id: number, data: { acknowledged?: boolean; resolved?: boolean }) =>
    request<Alert>(`/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  triggerTestAlert: () => request<Alert>('/alerts/test-trigger', { method: 'POST' }),

  // Electricity (Disabled / Isolated)
  getElectricityConfig: () => request<ElectricityConfig>('/electricity'),
  updateElectricityConfig: (data: Partial<ElectricityConfig>) =>
    request<ElectricityConfig>('/electricity', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Analytics & AI
  getAnalyticsSummary: () => request<AnalyticsSummary>('/analytics/summary'),
  getAIInsights: () => request<AIInsightsResponse>('/ai/insights'),

  // Device Config
  getDeviceConfig: () => request<DeviceConfig>('/device'),
  updateDeviceConfig: (data: Partial<DeviceConfig>) =>
    request<DeviceConfig>('/device', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // CSV Report download helper
  getDownloadCsvUrl: (start_date?: string, end_date?: string, limit = 5000) => {
    const qs = new URLSearchParams({ limit: limit.toString() });
    if (start_date) qs.set('start_date', start_date);
    if (end_date) qs.set('end_date', end_date);
    return `${API_BASE}/reports/csv?${qs.toString()}`;
  },

  // Supabase Cloud Sync
  getSupabaseStatus: () =>
    request<{
      enabled: boolean;
      connected: boolean;
      url: string;
      project_ref: string;
      tables_registered?: string[];
      message: string;
    }>('/supabase/status'),
  syncAllToSupabase: () =>
    request<{
      status: string;
      readings_synced: number;
      alerts_synced: number;
      message: string;
    }>('/supabase/sync-all', { method: 'POST' }),
};
