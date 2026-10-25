import React, { useState, useEffect } from 'react';
import {
  Zap,
  ZapOff,
  ShieldAlert,
  Save,
  CheckCircle2,
  Info,
  Layers,
  FileCode,
  Cpu,
} from 'lucide-react';
import { api } from '../services/api';
import { ElectricityConfig } from '../types';

export const ElectricitySetupPage: React.FC = () => {
  const [config, setConfig] = useState<ElectricityConfig | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [meterModel, setMeterModel] = useState('');
  const [interfaceType, setInterfaceType] = useState('RS485 / Modbus RTU');
  const [baudRate, setBaudRate] = useState(9600);
  const [parity, setParity] = useState('None');
  const [slaveAddress, setSlaveAddress] = useState(1);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getElectricityConfig().then((cfg) => {
      setConfig(cfg);
      setIsEnabled(cfg.is_enabled);
      setMeterModel(cfg.meter_model);
      setInterfaceType(cfg.interface_type);
      setBaudRate(cfg.baud_rate);
      setParity(cfg.parity);
      setSlaveAddress(cfg.slave_address);
      setNotes(cfg.notes);
    });
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const updated = await api.updateElectricityConfig({
        is_enabled: isEnabled,
        meter_model: meterModel,
        interface_type: interfaceType,
        baud_rate: baudRate,
        parity: parity,
        slave_address: slaveAddress,
        notes: notes,
      });
      setConfig(updated);
      setMessage('Electricity meter hardware profile saved successfully.');
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      alert(`Error saving electricity config: ${err.message}`);
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
            <span className="brutalist-badge border-amber-400 text-amber-400 bg-black">
              MODULAR DRIVER
            </span>
            <span className="brutalist-badge border-cyber-cyan text-cyber-cyan bg-black">
              ZERO-FABRICATION
            </span>
          </div>

          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight mt-2 flex items-center gap-2 font-mono">
            <Zap className="w-6 h-6 text-amber-400 animate-pulse" />
            ELECTRICITY METER INTEGRATION (MODULAR EXTENSION)
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-mono">
            Independent modular driver &bull; Hardware specification registry &bull; Strictly isolated from water engine
          </p>
        </div>

        <div className="relative z-10">
          <span className="brutalist-badge border-amber-400 text-amber-400 bg-black px-3 py-1">
            STATUS: {config?.status || 'NOT CONFIGURED'}
          </span>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 liquid-glass-blue border border-cyber-cyan/50 text-cyber-cyan shadow-[0_0_20px_rgba(0,210,255,0.3)]">
          <CheckCircle2 className="w-4 h-4 text-cyber-cyan shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Isolation Guarantee Banner */}
      <div className="p-5 rounded-3xl liquid-glass border border-amber-400/30 flex items-start gap-3.5 shadow-xl">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1 font-mono">
          <strong className="text-white block font-black uppercase tracking-wider">
            HARDWARE ISOLATION &amp; ZERO-FABRICATION GUARANTEE
          </strong>
          <p className="leading-relaxed">
            Per system requirements, electricity telemetry is disabled by default and will display <strong>“Not configured”</strong> until physical energy meter hardware (e.g. Schneider, Selec, or Eastron RS485 Modbus) is identified and wired. This module never invents fake voltage, current, or kWh values, and its configuration will never disrupt water telemetry.
          </p>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-6 border border-white/10 bento-card shadow-2xl">
        <div className="absolute top-3 right-3 skeuo-screw" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyber-cyan" />
            <h2 className="text-xs font-black uppercase tracking-wider text-white font-mono">
              HARDWARE SPECIFICATION &amp; MODBUS PARAMETERS
            </h2>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <span className="text-xs font-bold text-slate-300 font-mono">ENABLE MODULE:</span>
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-cyber-cyan focus:ring-0 bg-black border-white/20 cursor-pointer accent-neon-rose"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              METER MANUFACTURER &amp; MODEL
            </label>
            <input
              type="text"
              placeholder="e.g. Selec EM306-A / Schneider IEM3150 / Eastron SDM630"
              value={meterModel}
              onChange={(e) => setMeterModel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-black/80 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan shadow-inner"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Leave blank if meter model has not yet been selected.
            </span>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              HARDWARE INTERFACE BUS
            </label>
            <select
              value={interfaceType}
              onChange={(e) => setInterfaceType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-black/80 border border-white/15 text-xs text-white focus:outline-none focus:border-cyber-cyan shadow-inner font-mono font-bold"
            >
              <option value="RS485 / Modbus RTU">RS485 / Modbus RTU (Differential Serial)</option>
              <option value="Optocoupled S0 Pulse">Optocoupled S0 Pulse Output (1000 imp/kWh)</option>
              <option value="Modbus TCP / IP">Modbus TCP / IP (Ethernet)</option>
              <option value="Optical IR Probe">Optical IR Probe (IEC 62056-21)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              BAUD RATE (BPS)
            </label>
            <select
              value={baudRate}
              onChange={(e) => setBaudRate(parseInt(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-black/80 border border-white/15 text-xs text-white focus:outline-none focus:border-cyber-cyan shadow-inner font-mono font-bold"
            >
              <option value={9600}>9600 bps</option>
              <option value={19200}>19200 bps</option>
              <option value={38400}>38400 bps</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              MODBUS RTU SLAVE ID ADDRESS
            </label>
            <input
              type="number"
              min="1"
              max="247"
              value={slaveAddress}
              onChange={(e) => setSlaveAddress(parseInt(e.target.value) || 1)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-black/80 border border-white/15 text-xs text-white focus:outline-none focus:border-cyber-cyan shadow-inner font-mono font-bold"
            />
          </div>
        </div>

        <div className="mt-6 font-mono">
          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
            DOCUMENTATION &amp; REGISTER MAPPING NOTES
          </label>
          <textarea
            rows={3}
            placeholder="Record register addresses (e.g. 30001 = Total Active Energy kWh, 30013 = Voltage V) and wiring instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-black/80 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan shadow-inner"
          />
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="clay-pill-blue px-6 py-2.5 text-xs font-black font-mono tracking-wider text-white shadow-[0_0_20px_rgba(0,210,255,0.4)] flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'SAVING...' : 'SAVE METER SPECIFICATIONS'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
