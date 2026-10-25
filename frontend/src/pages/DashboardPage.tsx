import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Droplets,
  Gauge,
  Calendar,
  IndianRupee,
  Activity,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  Clock,
  ZapOff,
  Radio,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { ShellContextType } from '../components/layout/Shell';
import { MetricCard } from '../components/common/MetricCard';
import { FlowGauge } from '../components/common/FlowGauge';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatINR, formatVolume, formatFlow, formatDateTime, formatTimeAgo } from '../utils/formatters';
import { api } from '../services/api';
import { AnalyticsSummary, WaterReading } from '../types';

export const DashboardPage: React.FC = () => {
  const { status, alerts } = useOutletContext<ShellContextType>();

  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recentReadings, setRecentReadings] = useState<WaterReading[]>([]);
  const [filterRange, setFilterRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [sum, rec] = await Promise.all([
          api.getAnalyticsSummary(),
          api.getRecentStream(10),
        ]);
        setAnalytics(sum);
        setRecentReadings(rec);
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      }
    };
    loadDashboardData();
  }, [status?.total_liters]);

  const chartData =
    filterRange === '24h'
      ? analytics?.hourly_trends.map((h) => ({ name: h.label, liters: h.liters, cost: h.cost_inr })) || []
      : analytics?.daily_trends.map((d) => ({ name: d.date, liters: d.liters, cost: d.cost_inr })) || [];

  return (
    <div className="space-y-6">
      {/* =========================================================================
          SPATIAL HERO HUD: SYSTEM OVERVIEW & TELEMETRY BEACON
          ========================================================================= */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-6 lg:p-7 relative overflow-hidden bento-card border border-white/10 shadow-2xl">
        {/* Skeuomorphic corner screw details */}
        <div className="absolute top-3 left-3 skeuo-screw hidden sm:block" />
        <div className="absolute top-3 right-3 skeuo-screw hidden sm:block" />

        {/* Ambient Spatial Lighting Halos */}
        <div className="absolute -top-24 left-1/4 w-72 h-72 rounded-full bg-cyber-blue/15 filter blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-72 h-72 rounded-full bg-neon-rose/15 filter blur-[90px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="brutalist-badge border-cyber-cyan text-cyber-cyan bg-black">
                TELEMETRY CORE V2.4
              </span>
              {status?.is_simulated ? (
                <span className="brutalist-badge border-neon-rose text-neon-rose bg-black animate-pulse">
                  SIMULATION ACTIVE
                </span>
              ) : (
                <span className="brutalist-badge border-emerald-400 text-emerald-400 bg-black">
                  ARDUINO HARDWARE
                </span>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight mt-2 flex items-center gap-3 font-mono">
              SMART WATER <span className="cyber-gradient-text">&amp; ENERGY</span> MANAGER
            </h1>

            <p className="text-xs text-slate-300 mt-1 font-mono flex items-center gap-2 flex-wrap">
              <span>PORT: <strong className="text-cyber-cyan">{status?.port || 'COM3'}</strong></span>
              <span className="text-white/20">&bull;</span>
              <span>BAUD: <strong className="text-white">{status?.baud_rate || 9600}</strong></span>
              <span className="text-white/20">&bull;</span>
              <span>FRESHNESS: <strong className="text-neon-rose">{formatTimeAgo(status?.data_freshness_seconds)}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/monitoring"
              className="clay-pill px-4 py-2 text-xs font-black font-mono tracking-wider text-white border-cyber-cyan/40 bg-gradient-to-r from-cyber-blue to-cyber-cyan hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,210,255,0.4)] flex items-center gap-2"
            >
              <Activity className="w-4 h-4 text-white" />
              <span>LIVE OSCILLOSCOPE</span>
            </Link>

            <Link
              to="/arduino-config"
              className="clay-pill px-4 py-2 text-xs font-black font-mono tracking-wider text-neon-rose border-neon-rose/40 bg-black/60 hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,0,127,0.3)] flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-neon-rose" />
              <span>SERIAL BUS</span>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BENTO GRID LAYER 1: KPI METRICS (BLACK, BLUE & NEON ROSE)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Instantaneous Flow"
          value={status ? status.flow_rate_lpm.toFixed(2) : '0.00'}
          unit="L/min"
          icon={Gauge}
          subtitle={`Turbine pulses: ${status?.pulses || 0}/s`}
          accentColor="cyan"
          className="hover:scale-[1.02]"
        />

        <MetricCard
          title="Cumulative Total"
          value={status ? formatVolume(status.total_liters) : '0.0 L'}
          icon={Droplets}
          subtitle="Lifetime volume logged"
          accentColor="rose"
          className="hover:scale-[1.02]"
        />

        <MetricCard
          title="Today's Consumption"
          value={status ? `${status.today_consumption_liters.toFixed(1)}` : '0.0'}
          unit="Liters"
          icon={Calendar}
          subtitle={`Daily budget: ${status?.daily_budget_liters || 500} L`}
          trend={{
            value: analytics?.change_percent_vs_yesterday || 0,
            isPositiveGood: false,
            label: 'vs yesterday',
          }}
          accentColor="blue"
          className="hover:scale-[1.02]"
        />

        <MetricCard
          title="Today's Estimated Cost"
          value={formatINR(status?.today_cost_inr || 0)}
          icon={IndianRupee}
          subtitle="Tiered INR municipal tariff"
          accentColor="rose"
          className="hover:scale-[1.02]"
        />
      </div>

      {/* =========================================================================
          BENTO GRID LAYER 2: SKEUOMORPHIC FLOW TACHOMETER & LIQUID GLASS CHARTS
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tachometer Flow Gauge Card (Span 4) */}
        <div className="lg:col-span-5 liquid-glass liquid-sheen rounded-3xl p-6 flex flex-col items-center justify-between relative overflow-hidden bento-card border border-white/10 shadow-2xl">
          <div className="absolute top-3 left-3 skeuo-screw" />
          <div className="absolute top-3 right-3 skeuo-screw" />

          <div className="w-full flex items-center justify-between mb-2 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyber-cyan shadow-[0_0_8px_#00D2FF] animate-ping" />
                <h2 className="text-xs font-black uppercase font-mono tracking-widest text-slate-200">
                  TURBINE TACHOMETER
                </h2>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">YF-S201 Hall-Effect Sensor</p>
            </div>
            <StatusBadge
              status={status?.sensor_status || 'OFFLINE'}
              isSimulated={status?.is_simulated}
            />
          </div>

          <div className="py-2 w-full flex justify-center relative z-10">
            <FlowGauge flowRate={status?.flow_rate_lpm || 0} maxFlow={30} warningThreshold={25} />
          </div>

          {/* Neomorphic Inset Telemetry Channels */}
          <div className="w-full grid grid-cols-2 gap-3 text-center text-xs font-mono pt-3 border-t border-white/10 relative z-10">
            <div className="p-3 rounded-2xl bg-black/60 border border-white/5 shadow-inner">
              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">SEQUENCE PACKET</span>
              <span className="font-black text-white text-sm">#{status?.connected ? '1042' : '---'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/60 border border-white/5 shadow-inner">
              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">SAMPLING GATE</span>
              <span className="font-black text-cyber-cyan text-sm">1000 MS</span>
            </div>
          </div>
        </div>

        {/* Consumption Trends & Area Chart (Span 7) */}
        <div className="lg:col-span-7 liquid-glass liquid-sheen rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden bento-card border border-white/10 shadow-2xl">
          <div className="absolute top-3 right-3 skeuo-screw" />

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-black text-white tracking-tight font-mono flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-neon-rose" />
                  WATER TELEMETRY ACCUMULATOR
                </h2>
                <p className="text-xs text-slate-400 font-mono">Continuous pulse integration against budget threshold</p>
              </div>

              {/* Range Selector with Claymorphic Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-black/80 rounded-2xl border border-white/10 self-start">
                {(['24h', '7d', '30d'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setFilterRange(r)}
                    className={`px-3 py-1 rounded-xl text-xs font-black font-mono tracking-wider transition-all ${
                      filterRange === r
                        ? 'clay-pill-rose text-white shadow-[0_0_15px_rgba(255,0,127,0.5)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Target Progress Bar (Skeuomorphic Tank Indicator) */}
            <div className="mb-5 p-4 rounded-2xl bg-black/60 border border-white/10 shadow-inner">
              <div className="flex items-center justify-between text-xs mb-2 font-mono">
                <span className="font-bold text-slate-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-neon-rose shadow-[0_0_8px_#FF007F]" />
                  DAILY BUDGET QUOTA
                </span>
                <span className="font-extrabold text-white">
                  <span className="text-cyber-cyan">{status?.today_consumption_liters.toFixed(1)}</span> /{' '}
                  {status?.daily_budget_liters || 500} L (
                  <span className="text-neon-rose">{status?.budget_usage_percent.toFixed(0)}%</span>)
                </span>
              </div>

              {/* Neomorphic Bar Track */}
              <div className="w-full h-3.5 rounded-full bg-obsidian-950 p-[2px] border border-white/10 shadow-inner overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-cyber-cyan via-cyber-blue to-neon-rose shadow-[0_0_15px_rgba(255,0,127,0.6)]"
                  style={{ width: `${Math.min(status?.budget_usage_percent || 0, 100)}%` }}
                />
              </div>
            </div>

            {/* Recharts Area Chart in Glowing Cyber Palette */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cyberNeonGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D2FF" stopOpacity={0.45} />
                      <stop offset="65%" stopColor="#FF007F" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#000000" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
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
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(5, 8, 17, 0.95)',
                      borderColor: '#FF007F',
                      color: '#FFFFFF',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono',
                      boxShadow: '0 0 25px rgba(255, 0, 127, 0.4)',
                    }}
                    formatter={(val: any) => [`${val} Liters`, 'Consumption']}
                  />
                  <Area
                    type="monotone"
                    dataKey="liters"
                    stroke="#00D2FF"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#cyberNeonGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>PEAK HOUR: <strong className="text-white font-black">{analytics?.peak_usage_hour || 'N/A'}</strong></span>
            <span>PROJECTED MONTH: <strong className="text-neon-rose font-black">{analytics?.projected_month_l || 0} L</strong> (~{formatINR(analytics?.estimated_bill_inr || 0)})</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BENTO GRID LAYER 3: ELECTRICITY METER (ISOLATED) & RECENT TELEMETRY TABLE
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Electricity Module Card: Explicitly Not Configured per instructions (Span 4) */}
        <div className="lg:col-span-4 liquid-glass liquid-sheen rounded-3xl p-6 flex flex-col justify-between border border-white/10 bento-card shadow-2xl">
          <div className="absolute top-3 left-3 skeuo-screw" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <ZapOff className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white font-mono">ELECTRICITY METER</h3>
              </div>
              <span className="brutalist-badge border-amber-400 text-amber-400 bg-black">
                NOT CONFIGURED
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4 font-mono">
              Electricity telemetry module is an independent extension. Hardware meter and communication protocol have not yet been wired. Zero simulated or fabricated wattage is recorded.
            </p>

            <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 text-xs space-y-2 text-slate-400 mb-4 font-mono shadow-inner">
              <div className="flex justify-between">
                <span>INTERFACE:</span>
                <span className="text-white font-bold">RS485 / MODBUS RTU</span>
              </div>
              <div className="flex justify-between">
                <span>DRIVER:</span>
                <span className="text-amber-400 font-bold">AWAITING HARDWARE</span>
              </div>
              <div className="flex justify-between">
                <span>WATER TELEMETRY:</span>
                <span className="text-cyber-cyan font-bold">100% OPERATIONAL</span>
              </div>
            </div>
          </div>

          <Link
            to="/electricity"
            className="w-full clay-pill px-4 py-2.5 text-xs font-black font-mono tracking-wider text-white border-white/20 bg-black/80 hover:border-cyber-cyan hover:text-cyber-cyan transition-all text-center flex items-center justify-center gap-2"
          >
            <span>REGISTER HARDWARE SPEC</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Live Stream Telemetry Table (Span 8) */}
        <div className="lg:col-span-8 liquid-glass liquid-sheen rounded-3xl p-6 border border-white/10 bento-card shadow-2xl">
          <div className="absolute top-3 right-3 skeuo-screw" />

          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyber-cyan animate-pulse" />
                RECENT TELEMETRY BUS PACKETS
              </h3>
              <p className="text-xs text-slate-400 font-mono">High-resolution 1-second pulse intervals from Arduino</p>
            </div>
            <Link
              to="/history"
              className="clay-pill px-3 py-1 text-[10px] font-black font-mono text-neon-rose border-neon-rose/40 hover:scale-105 transition-transform flex items-center gap-1.5"
            >
              FULL ARCHIVE <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[10px] uppercase tracking-wider text-slate-400 bg-black/60 border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">TIMESTAMP</th>
                  <th className="py-2.5 px-3">FLOW (L/MIN)</th>
                  <th className="py-2.5 px-3">PULSES</th>
                  <th className="py-2.5 px-3">CUMULATIVE</th>
                  <th className="py-2.5 px-3">SEQ</th>
                  <th className="py-2.5 px-3 text-right">SOURCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {recentReadings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-mono">
                      Awaiting initial sensor packets. Turn on tap or click "RUN TEST SIM".
                    </td>
                  </tr>
                ) : (
                  recentReadings.slice(0, 6).map((r) => (
                    <tr key={r.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400">{formatDateTime(r.timestamp)}</td>
                      <td className="py-2.5 px-3 font-black text-white">{formatFlow(r.flow_rate_lpm)}</td>
                      <td className="py-2.5 px-3 font-bold text-cyber-cyan">{r.pulses}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-200">{r.total_liters.toFixed(2)} L</td>
                      <td className="py-2.5 px-3 text-slate-400">#{r.sequence_id}</td>
                      <td className="py-2.5 px-3 text-right">
                        {r.is_simulated ? (
                          <span className="brutalist-badge text-[9px] py-0 px-1 border-neon-rose text-neon-rose">
                            SIM
                          </span>
                        ) : (
                          <span className="brutalist-badge text-[9px] py-0 px-1 border-cyber-cyan text-cyber-cyan">
                            HW
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
