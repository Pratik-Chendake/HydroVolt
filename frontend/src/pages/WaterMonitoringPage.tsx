import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Activity,
  Play,
  Pause,
  RefreshCw,
  Terminal,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Radio,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { ShellContextType } from '../components/layout/Shell';
import { FlowGauge } from '../components/common/FlowGauge';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatFlow, formatVolume, formatDateTime } from '../utils/formatters';
import { api } from '../services/api';
import { wsClient } from '../services/websocket';
import { WaterReading } from '../types';

export const WaterMonitoringPage: React.FC = () => {
  const { status, refreshStatus } = useOutletContext<ShellContextType>();

  const [streamData, setStreamData] = useState<WaterReading[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [rawLogs, setRawLogs] = useState<string[]>([]);

  useEffect(() => {
    api.getRecentStream(20).then(setStreamData).catch(() => {});

    const unsubscribe = wsClient.subscribe((payload) => {
      if (isPaused) return;

      if (payload.type === 'TELEMETRY_UPDATE') {
        const newReading: WaterReading = {
          id: Date.now(),
          timestamp: payload.timestamp,
          flow_rate_lpm: payload.flow_rate_lpm,
          pulses: payload.pulses,
          total_liters: payload.total_liters,
          sequence_id: payload.sequence_id,
          sensor_id: payload.sensor_id,
          status: payload.sensor_status,
          is_simulated: payload.is_simulated,
        };

        setStreamData((prev) => [...prev.slice(-24), newReading]);

        const logLine = JSON.stringify({
          seq: payload.sequence_id,
          sensor: payload.sensor_id,
          flow_lpm: payload.flow_rate_lpm,
          pulses: payload.pulses,
          total_l: payload.total_liters,
          status: payload.sensor_status,
        });
        setRawLogs((prev) => [logLine, ...prev.slice(0, 30)]);
      }
    });

    return () => unsubscribe();
  }, [isPaused]);

  const currentFlow = status?.flow_rate_lpm || 0;
  const estimatedFrequencyHz = Math.round((currentFlow * 450.0) / 60.0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-6 relative overflow-hidden bento-card border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute top-3 left-3 skeuo-screw hidden sm:block" />
        <div className="absolute top-3 right-3 skeuo-screw hidden sm:block" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="brutalist-badge border-cyber-cyan text-cyber-cyan bg-black">
              LIVE SIGNAL COCKPIT
            </span>
            <span className="brutalist-badge border-neon-rose text-neon-rose bg-black">
              25-SEC BUFFER
            </span>
          </div>

          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight mt-2 flex items-center gap-2 font-mono">
            <Activity className="w-6 h-6 text-cyber-cyan animate-pulse drop-shadow-[0_0_8px_#00D2FF]" />
            REAL-TIME WATER MONITORING OSCILLOSCOPE
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-mono">
            Millisecond-resolution pulse decoding &bull; USB Serial Newline-Delimited JSON (NDJSON)
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`clay-pill px-4 py-2 text-xs font-black font-mono tracking-wider transition-all flex items-center gap-2 ${
              isPaused
                ? 'clay-pill-rose text-white shadow-[0_0_15px_rgba(255,0,127,0.5)]'
                : 'clay-pill-blue text-white shadow-[0_0_15px_rgba(0,210,255,0.4)]'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span>{isPaused ? 'RESUME STREAM' : 'PAUSE STREAM'}</span>
          </button>

          <StatusBadge
            status={status?.sensor_status || 'OFFLINE'}
            isSimulated={status?.is_simulated}
          />
        </div>
      </div>

      {/* Main Flow Visualizer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tachometer Visualizer Card (Span 5) */}
        <div className="lg:col-span-5 liquid-glass liquid-sheen rounded-3xl p-6 flex flex-col items-center justify-between border border-white/10 bento-card shadow-2xl">
          <div className="absolute top-3 left-3 skeuo-screw" />
          <div className="absolute top-3 right-3 skeuo-screw" />

          <div className="w-full flex items-center justify-between mb-4 relative z-10">
            <span className="text-xs font-black uppercase font-mono tracking-wider text-slate-300 flex items-center gap-2">
              <Radio className="w-4 h-4 text-neon-rose animate-pulse" />
              SENSOR TACHOMETER
            </span>
            <span className="brutalist-badge border-cyber-cyan text-cyber-cyan bg-black">
              PIN D2 (INT0)
            </span>
          </div>

          <div className="py-2 w-full flex justify-center relative z-10">
            <FlowGauge flowRate={currentFlow} maxFlow={30} warningThreshold={25} />
          </div>

          <div className="w-full grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10 font-mono text-xs relative z-10">
            <div className="p-3 rounded-2xl bg-black/60 border border-white/5 shadow-inner text-center">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">PULSE FREQUENCY</span>
              <span className="text-base font-black text-cyber-cyan">{estimatedFrequencyHz} HZ</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/60 border border-white/5 shadow-inner text-center">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">SAMPLING GATE</span>
              <span className="text-base font-black text-white">1000 MS</span>
            </div>
          </div>
        </div>

        {/* Real-time Oscilloscope Line Chart (Span 7) */}
        <div className="lg:col-span-7 liquid-glass liquid-sheen rounded-3xl p-6 flex flex-col justify-between border border-white/10 bento-card shadow-2xl">
          <div className="absolute top-3 right-3 skeuo-screw" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyber-cyan" />
                  REAL-TIME FLOW VELOCITY WAVEFORM
                </h2>
                <p className="text-xs text-slate-400 font-mono">Rolling window of 25 consecutive telemetry intervals</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyber-cyan shadow-[0_0_8px_#00D2FF]" />
                </span>
                <span className="text-[11px] font-mono text-cyber-cyan font-extrabold">1-SEC TICKS</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={streamData}>
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(t) => (t ? t.slice(11, 19) : '')}
                    stroke="#64748B"
                    fontSize={10}
                    fontFamily="JetBrains Mono"
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={10}
                    fontFamily="JetBrains Mono"
                    tickLine={false}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(4, 7, 16, 0.95)',
                      borderColor: '#00D2FF',
                      color: '#FFFFFF',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono',
                      boxShadow: '0 0 20px rgba(0, 210, 255, 0.4)',
                    }}
                    formatter={(val: any) => [`${val} L/min`, 'Flow Velocity']}
                  />
                  <Line
                    type="monotone"
                    dataKey="flow_rate_lpm"
                    stroke="#00D2FF"
                    strokeWidth={3}
                    dot={{ fill: '#FF007F', r: 3, stroke: '#FFFFFF', strokeWidth: 1 }}
                    activeDot={{ r: 7, fill: '#FF007F', stroke: '#00D2FF', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs font-mono text-center">
            <div className="p-3 rounded-2xl bg-black/60 border border-white/5 shadow-inner">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">ACCUMULATOR</span>
              <strong className="text-white text-sm font-black">{status?.total_liters.toFixed(2)} L</strong>
            </div>
            <div className="p-3 rounded-2xl bg-black/60 border border-white/5 shadow-inner">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">INTERVAL PULSES</span>
              <strong className="text-cyber-cyan text-sm font-black">{status?.pulses || 0}</strong>
            </div>
            <div className="p-3 rounded-2xl bg-black/60 border border-white/5 shadow-inner">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">PACKET INTEGRITY</span>
              <strong className="text-neon-rose text-sm font-black">100.0%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Raw NDJSON Terminal Feed (Brutalist + Neomorphic Inset) */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-6 border border-white/10 bento-card shadow-2xl">
        <div className="absolute top-3 right-3 skeuo-screw" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-neon-rose animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-wider text-white font-mono">
              SERIAL NDJSON PACKET BUS (LIVE HARDWARE STREAM)
            </h2>
          </div>
          <button
            onClick={() => setRawLogs([])}
            className="clay-pill px-3 py-1 text-[10px] font-black font-mono text-slate-300 hover:text-white border-white/10 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>PURGE CONSOLE</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-black/90 border border-white/10 font-mono text-xs text-cyber-cyan h-56 overflow-y-auto space-y-1.5 shadow-inner">
          {rawLogs.length === 0 ? (
            <div className="text-slate-500 italic p-2">
              Awaiting JSON packets from Python USB Serial bridge... Check that Arduino is plugged into COM port or Test Simulator is active.
            </div>
          ) : (
            rawLogs.map((log, idx) => (
              <div key={idx} className="flex gap-2.5 hover:bg-white/5 px-2 py-0.5 rounded transition-colors font-mono">
                <span className="text-neon-rose font-bold select-none">{String(idx + 1).padStart(2, '0')}:</span>
                <span className="text-slate-200">{log}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
