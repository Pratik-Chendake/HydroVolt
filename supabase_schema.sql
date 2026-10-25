-- =========================================================================
-- Smart Water & Energy Manager (HydoVolt) - Supabase Cloud Schema
-- Project: https://escefqdmzcqcfbgqwjil.supabase.co
-- Description: Run this SQL in your Supabase Dashboard -> SQL Editor
-- =========================================================================

-- 1. WATER READINGS (High-resolution telemetry stream)
CREATE TABLE IF NOT EXISTS public.water_readings (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    flow_rate_lpm DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    pulses INTEGER DEFAULT 0 NOT NULL,
    total_liters DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    sequence_id BIGINT DEFAULT 0 NOT NULL,
    sensor_id VARCHAR(50) DEFAULT 'YF-S201',
    status VARCHAR(20) DEFAULT 'OK',
    is_simulated BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_water_readings_timestamp ON public.water_readings (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_water_readings_sequence ON public.water_readings (sequence_id);

-- 2. DAILY SUMMARIES (Aggregated consumption & billing)
CREATE TABLE IF NOT EXISTS public.daily_summaries (
    date DATE PRIMARY KEY,
    total_liters DOUBLE PRECISION DEFAULT 0.0,
    peak_flow_lpm DOUBLE PRECISION DEFAULT 0.0,
    peak_hour INTEGER DEFAULT 0,
    estimated_cost_inr DOUBLE PRECISION DEFAULT 0.0,
    readings_count INTEGER DEFAULT 0
);

-- 3. CALIBRATION RECORDS (Audit trail for bucket test k-factor derivations)
CREATE TABLE IF NOT EXISTS public.calibration_records (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    sensor_model VARCHAR(50) DEFAULT 'YF-S201',
    sensor_pin VARCHAR(20) DEFAULT 'D2',
    test_volume_liters DOUBLE PRECISION NOT NULL,
    pulses_recorded INTEGER NOT NULL,
    calculated_k_factor DOUBLE PRECISION NOT NULL,
    previous_k_factor DOUBLE PRECISION NOT NULL,
    applied BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- 4. ALERTS & EVENT LOGS
CREATE TABLE IF NOT EXISTS public.alerts (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'warning',
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    flow_rate_observed DOUBLE PRECISION,
    acknowledged BOOLEAN DEFAULT FALSE,
    resolved BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON public.alerts (timestamp DESC);

-- 5. TARIFF CONFIGURATION (Tiered INR billing schedule)
CREATE TABLE IF NOT EXISTS public.tariff_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    tier1_limit_liters DOUBLE PRECISION DEFAULT 10000.0,
    tier1_rate_per_kl DOUBLE PRECISION DEFAULT 15.0,
    tier2_limit_liters DOUBLE PRECISION DEFAULT 25000.0,
    tier2_rate_per_kl DOUBLE PRECISION DEFAULT 25.0,
    tier3_rate_per_kl DOUBLE PRECISION DEFAULT 40.0,
    fixed_meter_charge DOUBLE PRECISION DEFAULT 50.0,
    sewerage_charge_percent DOUBLE PRECISION DEFAULT 10.0,
    monthly_target_liters DOUBLE PRECISION DEFAULT 15000.0,
    daily_target_liters DOUBLE PRECISION DEFAULT 500.0,
    currency VARCHAR(10) DEFAULT '₹'
);

-- Seed default tariffs if empty
INSERT INTO public.tariff_config (id, tier1_limit_liters, tier1_rate_per_kl, tier2_limit_liters, tier2_rate_per_kl, tier3_rate_per_kl, fixed_meter_charge, sewerage_charge_percent, monthly_target_liters, daily_target_liters, currency)
VALUES (1, 10000.0, 15.0, 25000.0, 25.0, 40.0, 50.0, 10.0, 15000.0, 500.0, '₹')
ON CONFLICT (id) DO NOTHING;

-- 6. DEVICE CONFIGURATION (MCU & Hardware Thresholds)
CREATE TABLE IF NOT EXISTS public.device_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    serial_port VARCHAR(50) DEFAULT 'COM3',
    baud_rate INTEGER DEFAULT 9600,
    auto_reconnect BOOLEAN DEFAULT TRUE,
    reconnect_interval_sec INTEGER DEFAULT 5,
    sensor_model VARCHAR(50) DEFAULT 'YF-S201 (Hall Effect)',
    sensor_pin VARCHAR(20) DEFAULT 'Pin D2 (Interrupt 0)',
    calibration_factor DOUBLE PRECISION DEFAULT 450.0,
    flow_warning_threshold_lpm DOUBLE PRECISION DEFAULT 25.0,
    continuous_leak_threshold_lpm DOUBLE PRECISION DEFAULT 0.25,
    continuous_leak_duration_mins INTEGER DEFAULT 45
);

INSERT INTO public.device_config (id, serial_port, baud_rate, auto_reconnect, reconnect_interval_sec, sensor_model, sensor_pin, calibration_factor, flow_warning_threshold_lpm, continuous_leak_threshold_lpm, continuous_leak_duration_mins)
VALUES (1, 'COM3', 9600, true, 5, 'YF-S201 (Hall Effect)', 'Pin D2 (Interrupt 0)', 450.0, 25.0, 0.25, 45)
ON CONFLICT (id) DO NOTHING;

-- 7. ELECTRICITY CONFIGURATION (Independent modular extension)
CREATE TABLE IF NOT EXISTS public.electricity_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    is_enabled BOOLEAN DEFAULT FALSE,
    meter_model VARCHAR(100) DEFAULT '',
    interface_type VARCHAR(50) DEFAULT 'RS485 / Modbus RTU',
    baud_rate INTEGER DEFAULT 9600,
    parity VARCHAR(20) DEFAULT 'None',
    slave_address INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'Not configured',
    notes TEXT DEFAULT 'Hardware electricity meter is not yet connected. Water monitoring operates completely independently.'
);

INSERT INTO public.electricity_config (id, is_enabled, meter_model, interface_type, baud_rate, parity, slave_address, status, notes)
VALUES (1, false, '', 'RS485 / Modbus RTU', 9600, 'None', 1, 'Not configured', 'Hardware electricity meter is not yet connected.')
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.water_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calibration_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tariff_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.electricity_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for anon client key)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access on water_readings') THEN
        CREATE POLICY "Allow public read access on water_readings" ON public.water_readings FOR SELECT TO anon, authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access on alerts') THEN
        CREATE POLICY "Allow public read access on alerts" ON public.alerts FOR SELECT TO anon, authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access on tariff_config') THEN
        CREATE POLICY "Allow public read access on tariff_config" ON public.tariff_config FOR SELECT TO anon, authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access on device_config') THEN
        CREATE POLICY "Allow public read access on device_config" ON public.device_config FOR SELECT TO anon, authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access on daily_summaries') THEN
        CREATE POLICY "Allow public read access on daily_summaries" ON public.daily_summaries FOR SELECT TO anon, authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access on calibration_records') THEN
        CREATE POLICY "Allow public read access on calibration_records" ON public.calibration_records FOR SELECT TO anon, authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access on electricity_config') THEN
        CREATE POLICY "Allow public read access on electricity_config" ON public.electricity_config FOR SELECT TO anon, authenticated USING (true);
    END IF;
END $$;

-- Allow service_role key full CRUD administrative access
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service_role full access on water_readings') THEN
        CREATE POLICY "Allow service_role full access on water_readings" ON public.water_readings FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service_role full access on alerts') THEN
        CREATE POLICY "Allow service_role full access on alerts" ON public.alerts FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service_role full access on tariff_config') THEN
        CREATE POLICY "Allow service_role full access on tariff_config" ON public.tariff_config FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service_role full access on device_config') THEN
        CREATE POLICY "Allow service_role full access on device_config" ON public.device_config FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service_role full access on daily_summaries') THEN
        CREATE POLICY "Allow service_role full access on daily_summaries" ON public.daily_summaries FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service_role full access on calibration_records') THEN
        CREATE POLICY "Allow service_role full access on calibration_records" ON public.calibration_records FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service_role full access on electricity_config') THEN
        CREATE POLICY "Allow service_role full access on electricity_config" ON public.electricity_config FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Enable Supabase Realtime Publication for instant live telemetry
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.water_readings, public.alerts;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignore if publication or table already mapped
END $$;
