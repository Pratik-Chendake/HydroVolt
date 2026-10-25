import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Usb,
  Radio,
  Play,
  Square,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Terminal,
  Cpu,
} from 'lucide-react';
import { ShellContextType } from '../components/layout/Shell';
import { api } from '../services/api';
import { SerialPortInfo } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const ArduinoConfigPage: React.FC = () => {
  const { status, refreshStatus } = useOutletContext<ShellContextType>();
  const [ports, setPorts] = useState<SerialPortInfo[]>([]);
  const [scanning, setScanning] = useState(false);
  const [selectedPort, setSelectedPort] = useState('COM3');
  const [selectedBaud, setSelectedBaud] = useState(9600);
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const scanPorts = async () => {
    try {
      setScanning(true);
      const available = await api.getSerialPorts();
      setPorts(available);
      if (available.length > 0 && !selectedPort) {
        setSelectedPort(available[0].port);
      }
    } catch (err: any) {
      setMessage({ text: `Port scan failed: ${err.message}`, type: 'error' });
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    scanPorts();
    if (status?.port) setSelectedPort(status.port);
    if (status?.baud_rate) setSelectedBaud(status.baud_rate);
  }, [status?.port, status?.baud_rate]);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setMessage(null);
      const res = await api.connectSerial(selectedPort, selectedBaud);
      setMessage({ text: res.message, type: 'success' });
      await refreshStatus();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setConnecting(true);
      setMessage(null);
      const res = await api.disconnectSerial();
      setMessage({ text: res.message, type: 'success' });
      await refreshStatus();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setConnecting(false);
    }
  };

  const handleToggleSimulation = async () => {
    try {
      setMessage(null);
      if (status?.is_simulated) {
        await api.stopSimulation();
        setMessage({ text: 'Simulation mode stopped.', type: 'success' });
      } else {
        await api.startSimulation();
        setMessage({ text: 'Simulation mode started with realistic flow cycles.', type: 'success' });
      }
      await refreshStatus();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
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
              USB SERIAL BRIDGE
            </span>
            <span className="brutalist-badge border-neon-rose text-neon-rose bg-black">
              PYSERIAL THREAD
            </span>
          </div>

          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight mt-2 flex items-center gap-2 font-mono">
            <Usb className="w-6 h-6 text-cyber-cyan animate-pulse drop-shadow-[0_0_8px_#00D2FF]" />
            ARDUINO USB SERIAL CONFIGURATION
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-mono">
            Physical COM port discovery &bull; PySerial bridge &bull; Offline deterministic simulator
          </p>
        </div>

        <div className="relative z-10">
          <StatusBadge
            status={status?.sensor_status || 'OFFLINE'}
            isSimulated={status?.is_simulated}
          />
        </div>
      </div>

      {/* Notification Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 border liquid-glass ${
            message.type === 'success'
              ? 'liquid-glass-blue border-cyber-cyan/50 text-cyber-cyan shadow-[0_0_20px_rgba(0,210,255,0.3)]'
              : 'liquid-glass-rose border-neon-rose/50 text-neon-rose shadow-[0_0_20px_rgba(255,0,127,0.3)]'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-cyber-cyan shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-neon-rose shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Connection Controls Grid (Bento) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Physical USB Serial Settings */}
        <div className="liquid-glass liquid-sheen rounded-3xl p-6 flex flex-col justify-between border border-white/10 bento-card shadow-2xl">
          <div className="absolute top-3 left-3 skeuo-screw" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyber-cyan" />
                PHYSICAL HARDWARE PORT SETTINGS
              </h2>
              <button
                onClick={scanPorts}
                disabled={scanning}
                className="clay-pill px-3 py-1 text-[10px] font-black font-mono text-cyber-cyan border-cyber-cyan/30 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${scanning ? 'animate-spin' : ''}`} />
                <span>SCAN PORTS</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-6 font-mono leading-relaxed">
              Connect your Arduino Uno or Arduino Nano via USB. Ensure the Arduino IDE Serial Monitor is closed to avoid port-locking conflicts.
            </p>

            <div className="space-y-4 font-mono">
              {/* COM Port Selector */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  TARGET COM PORT
                </label>
                <select
                  value={selectedPort}
                  onChange={(e) => setSelectedPort(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/80 border border-white/15 text-xs text-white font-bold font-mono focus:outline-none focus:border-cyber-cyan shadow-inner"
                >
                  {ports.length === 0 ? (
                    <option value="COM3">COM3 (Default Placeholder)</option>
                  ) : (
                    ports.map((p) => (
                      <option key={p.port} value={p.port}>
                        {p.port} — {p.description}
                      </option>
                    ))
                  )}
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {ports.length} physical port(s) registered in Windows Registry.
                </span>
              </div>

              {/* Baud Rate Selector */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  TRANSMISSION BAUD RATE
                </label>
                <select
                  value={selectedBaud}
                  onChange={(e) => setSelectedBaud(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-black/80 border border-white/15 text-xs text-white font-bold font-mono focus:outline-none focus:border-cyber-cyan shadow-inner"
                >
                  <option value={9600}>9600 bps (Standard Arduino Sketch)</option>
                  <option value={19200}>19200 bps</option>
                  <option value={38400}>38400 bps</option>
                  <option value={57600}>57600 bps</option>
                  <option value={115200}>115200 bps (High-Speed Debugging)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-white/10 mt-6 flex items-center gap-3">
            {status?.connected && !status?.is_simulated ? (
              <button
                onClick={handleDisconnect}
                disabled={connecting}
                className="w-full clay-pill-rose py-2.5 text-xs font-black font-mono tracking-wider text-white shadow-[0_0_20px_rgba(255,0,127,0.5)] transition-all"
              >
                DISCONNECT SERIAL PORT
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full clay-pill-blue py-2.5 text-xs font-black font-mono tracking-wider text-white shadow-[0_0_20px_rgba(0,210,255,0.4)] transition-all"
              >
                {connecting ? 'INITIALIZING HANDSHAKE...' : 'CONNECT TO ARDUINO'}
              </button>
            )}
          </div>
        </div>

        {/* Offline Test Simulator Mode */}
        <div className="liquid-glass liquid-sheen rounded-3xl p-6 flex flex-col justify-between border border-white/10 bento-card shadow-2xl">
          <div className="absolute top-3 right-3 skeuo-screw" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
                <Play className="w-4 h-4 text-neon-rose" />
                OFFLINE DETERMINISTIC SIMULATOR
              </h2>
              <span className="brutalist-badge border-neon-rose text-neon-rose bg-black">
                ZERO HARDWARE REQ
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-6 font-mono leading-relaxed">
              Presenting in a lecture hall or exhibition without physical plumbing? Run the offline test simulator to stream realistic diurnal tap patterns, seeping leaks, and showering flows.
            </p>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2 text-xs font-mono shadow-inner text-slate-300">
              <div className="flex justify-between">
                <span>SIMULATOR STATUS:</span>
                <strong className={status?.is_simulated ? 'text-neon-rose font-bold' : 'text-slate-400 font-bold'}>
                  {status?.is_simulated ? 'TRANSMITTING SYNTHETIC NDJSON' : 'IDLE / OFF'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>DATABASE PERSISTENCE:</span>
                <span className="text-cyber-cyan font-bold">100% PERSISTED (TAGGED)</span>
              </div>
              <div className="flex justify-between">
                <span>WEBSOCKET PUSH:</span>
                <span className="text-cyber-cyan font-bold">ACTIVE (/WS/LIVE)</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 mt-6">
            <button
              onClick={handleToggleSimulation}
              className={`w-full clay-pill py-2.5 text-xs font-black font-mono tracking-wider transition-all flex items-center justify-center gap-2 ${
                status?.is_simulated
                  ? 'clay-pill-rose text-white shadow-[0_0_20px_rgba(255,0,127,0.5)]'
                  : 'clay-pill-blue text-white shadow-[0_0_20px_rgba(0,210,255,0.4)]'
              }`}
            >
              {status?.is_simulated ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>HALT SIMULATOR TELEMETRY</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>START DETERMINISTIC TEST MODE</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
