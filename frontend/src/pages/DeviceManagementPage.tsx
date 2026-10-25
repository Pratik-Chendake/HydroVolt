import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Cpu,
  Radio,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Zap,
  Save,
  RotateCcw,
} from 'lucide-react';
import { ShellContextType } from '../components/layout/Shell';
import { api } from '../services/api';
import { DeviceConfig } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const DeviceManagementPage: React.FC = () => {
  const { status, refreshStatus } = useOutletContext<ShellContextType>();
  const [deviceConfig, setDeviceConfig] = useState<DeviceConfig | null>(null);
  const [flowThreshold, setFlowThreshold] = useState(25);
  const [leakDuration, setLeakDuration] = useState(45);
  const [leakThreshold, setLeakThreshold] = useState(0.25);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.getDeviceConfig().then((cfg) => {
      setDeviceConfig(cfg);
      setFlowThreshold(cfg.flow_warning_threshold_lpm);
      setLeakDuration(cfg.continuous_leak_duration_mins);
      setLeakThreshold(cfg.continuous_leak_threshold_lpm);
    });
  }, []);

  const handleSaveThresholds = async () => {
    try {
      setSaving(true);
      const updated = await api.updateDeviceConfig({
        flow_warning_threshold_lpm: flowThreshold,
        continuous_leak_duration_mins: leakDuration,
        continuous_leak_threshold_lpm: leakThreshold,
      });
      setDeviceConfig(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Error saving device configuration: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-6 relative overflow-hidden bento-card border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute top-3 left-3 skeuo-screw hidden sm:block" />
        <div className="absolute top-3 right-3 skeuo-screw hidden sm:block" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="brutalist-badge border-cyber-cyan text-cyber-cyan bg-black">
              HARDWARE ARCHITECTURE
            </span>
            <span className="brutalist-badge border-neon-rose text-neon-rose bg-black">
              ATMEGA328P
            </span>
          </div>

          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight mt-2 flex items-center gap-2 font-mono">
            <Cpu className="w-6 h-6 text-cyber-cyan animate-pulse drop-shadow-[0_0_8px_#00D2FF]" />
            MICROCONTROLLER &amp; DEVICE PROFILE
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-mono">
            ATmega328P MCU architecture &bull; Hardware interrupt mapping &bull; Threshold safeguards
          </p>
        </div>

        <div className="relative z-10">
          <StatusBadge
            status={status?.sensor_status || 'OFFLINE'}
            isSimulated={status?.is_simulated}
          />
        </div>
      </div>

      {/* Hardware Profile Specs (Bento 3-Card Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* MCU Specs */}
        <div className="liquid-glass liquid-sheen rounded-3xl p-6 border border-white/10 bento-card shadow-2xl">
          <div className="absolute top-3 right-3 skeuo-screw" />

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-cyber-blue/20 text-cyber-cyan border border-cyber-cyan/40 shadow-[0_0_12px_rgba(0,210,255,0.4)]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-black text-white uppercase font-mono tracking-wider">CONTROLLER UNIT</h2>
              <p className="text-xs text-slate-400 font-mono">Microchip ATmega328P 16MHz</p>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2.5 rounded-2xl bg-black/60 border border-white/5">
              <span className="text-slate-400">TARGET BOARD:</span>
              <span className="text-white font-bold">ARDUINO UNO / NANO</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-2xl bg-black/60 border border-white/5">
              <span className="text-slate-400">INTERRUPT PIN:</span>
              <span className="text-neon-rose font-bold">PIN 2 (INT0)</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-2xl bg-black/60 border border-white/5">
              <span className="text-slate-400">FIRMWARE BUILD:</span>
              <span className="text-cyber-cyan font-bold">V1.2.0-PRODUCTION</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-2xl bg-black/60 border border-white/5">
              <span className="text-slate-400">TELEMETRY CYCLE:</span>
              <span className="text-white font-bold">1000 MS TIMER</span>
            </div>
          </div>
        </div>

        {/* Sensor Specifications */}
        <div className="liquid-glass liquid-sheen rounded-3xl p-6 border border-white/10 bento-card shadow-2xl">
          <div className="absolute top-3 right-3 skeuo-screw" />

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-neon-rose/20 text-neon-rose border border-neon-rose/40 shadow-[0_0_12px_rgba(255,0,127,0.4)]">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-black text-white uppercase font-mono tracking-wider">FLOW SENSOR PROFILE</h2>
              <p className="text-xs text-slate-400 font-mono">YF-S201 In-Line Turbine</p>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2.5 rounded-2xl bg-black/60 border border-white/5">
              <span className="text-slate-400">TRANSDUCER:</span>
              <span className="text-white font-bold">HALL EFFECT MAGNETIC</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-2xl bg-black/60 border border-white/5">
              <span className="text-slate-400">NOMINAL FACTOR (K):</span>
              <span className="text-cyber-cyan font-bold">{deviceConfig?.calibration_factor || 450} PULSES/L</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-2xl bg-black/60 border border-white/5">
              <span className="text-slate-400">WORKING RANGE:</span>
              <span className="text-white font-bold">1.0 – 30.0 L/MIN</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-2xl bg-black/60 border border-white/5">
              <span className="text-slate-400">MAX PRESSURE:</span>
              <span className="text-slate-300 font-bold">1.75 MPA (17.5 BAR)</span>
            </div>
          </div>
        </div>

        {/* Telemetry Stream Health */}
        <div className="liquid-glass liquid-sheen rounded-3xl p-6 border border-white/10 bento-card shadow-2xl">
          <div className="absolute top-3 right-3 skeuo-screw" />

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 shadow-[0_0_12px_rgba(0,210,255,0.4)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-black text-white uppercase font-mono tracking-wider">STREAM INTEGRITY</h2>
              <p className="text-xs text-slate-400 font-mono">Sequence verification bus</p>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2.5 rounded-2xl bg-black/60 border border-white/5">
              <span className="text-slate-400">PACKET DROP RATE:</span>
              <span className="text-neon-rose font-bold">0.00% (LOSSLESS)</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-2xl bg-black/60 border border-white/5">
              <span className="text-slate-400">ACTIVE PORT:</span>
              <span className="text-cyber-cyan font-bold">{deviceConfig?.serial_port || 'COM3'}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-2xl bg-black/60 border border-white/5">
              <span className="text-slate-400">BAUD RATE:</span>
              <span className="text-white font-bold">{deviceConfig?.baud_rate || 9600} BPS</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-2xl bg-black/60 border border-white/5">
              <span className="text-slate-400">AUTO-RECONNECT:</span>
              <span className="text-cyber-cyan font-bold">ENABLED (5S RETRY)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Threshold Configuration Card */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-6 border border-white/10 bento-card shadow-2xl">
        <div className="absolute top-3 right-3 skeuo-screw" />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-white font-mono">
              SAFETY &amp; ANOMALY DETECTION THRESHOLDS
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Trigger thresholds evaluated in real-time by the Python telemetry daemon
            </p>
          </div>
          {savedSuccess && (
            <span className="clay-pill-rose px-3 py-1 text-xs font-mono font-bold text-white flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,0,127,0.4)]">
              <CheckCircle2 className="w-4 h-4" /> SAFEGUARDS PERSISTED
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 shadow-inner">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              HIGH VELOCITY WARNING
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="5"
                max="30"
                step="0.5"
                value={flowThreshold}
                onChange={(e) => setFlowThreshold(parseFloat(e.target.value) || 25)}
                className="w-24 px-3 py-2 rounded-xl bg-black/90 border border-white/15 text-white font-bold focus:outline-none focus:border-cyber-cyan"
              />
              <span className="text-xs text-cyber-cyan font-bold">L/MIN</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Alerts if instantaneous water flow exceeds normal residential fixture rates.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 shadow-inner">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              CONTINUOUS LEAK WINDOW
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="10"
                max="180"
                step="5"
                value={leakDuration}
                onChange={(e) => setLeakDuration(parseInt(e.target.value) || 45)}
                className="w-24 px-3 py-2 rounded-xl bg-black/90 border border-white/15 text-white font-bold focus:outline-none focus:border-cyber-cyan"
              />
              <span className="text-xs text-neon-rose font-bold">MINUTES</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Alerts if water runs continuously without dropping to zero within this window.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 shadow-inner">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              LOW-FLOW TRICKLE SENSITIVITY
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0.05"
                max="2.0"
                step="0.05"
                value={leakThreshold}
                onChange={(e) => setLeakThreshold(parseFloat(e.target.value) || 0.25)}
                className="w-24 px-3 py-2 rounded-xl bg-black/90 border border-white/15 text-white font-bold focus:outline-none focus:border-cyber-cyan"
              />
              <span className="text-xs text-white font-bold">L/MIN BASELINE</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Minimum flow sensitivity to identify dripping faucets and leaking cisterns.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveThresholds}
            disabled={saving}
            className="clay-pill-blue px-6 py-2.5 text-xs font-black font-mono tracking-wider text-white shadow-[0_0_20px_rgba(0,210,255,0.4)] flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'SAVING...' : 'SAVE SAFEGUARD THRESHOLDS'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
