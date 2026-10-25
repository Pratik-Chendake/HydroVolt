import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Clock,
  IndianRupee,
  Activity,
  Flame,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import { AnalyticsSummary } from '../types';
import { formatINR, formatVolume, formatFlow } from '../utils/formatters';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalyticsSummary()
      .then(setAnalytics)
      .catch((err) => console.warn('Analytics fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const hourlyChart =
    analytics?.hourly_trends.map((h) => ({
      hour: h.label,
      liters: h.liters,
      cost: h.cost_inr,
      peak: h.peak_lpm,
    })) || [];

  const dailyChart =
    analytics?.daily_trends.map((d) => ({
      date: d.date,
      liters: d.liters,
      cost: d.cost_inr,
      peak: d.peak_lpm,
    })) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-6 relative overflow-hidden bento-card border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute top-3 left-3 skeuo-screw hidden sm:block" />
        <div className="absolute top-3 right-3 skeuo-screw hidden sm:block" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="brutalist-badge border-cyber-cyan text-cyber-cyan bg-black">
              STATISTICAL MATRIX
            </span>
            <span className="brutalist-badge border-neon-rose text-neon-rose bg-black">
              30-DAY ROLLING
            </span>
          </div>

          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight mt-2 flex items-center gap-2 font-mono">
            <TrendingUp className="w-6 h-6 text-neon-rose animate-pulse drop-shadow-[0_0_8px_#FF007F]" />
            WATER CONSUMPTION ANALYTICS &amp; DEMAND PATTERNS
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-mono">
            Aggregated statistical metrics, peak hour clustering, and volumetric cost forecasting
          </p>
        </div>

        <div className="relative z-10">
          <div className="clay-pill px-4 py-2 bg-black/80 text-xs font-mono font-bold text-cyber-cyan border-cyber-cyan/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyber-cyan shadow-[0_0_8px_#00D2FF]" />
            <span>BASELINE ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Analytics KPI Row (Bento Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="liquid-glass liquid-sheen rounded-2xl p-5 border-l-4 border-l-cyber-cyan bento-card border-white/10 shadow-xl">
          <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest block mb-1">
            TODAY VS YESTERDAY
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">
              {analytics ? `${analytics.today_total_l.toFixed(1)} L` : '0 L'}
            </span>
            {analytics && analytics.change_percent_vs_yesterday !== 0 && (
              <span
                className={`clay-pill px-2 py-0.5 text-[10px] font-mono font-black flex items-center ${
                  analytics.change_percent_vs_yesterday < 0 ? 'text-cyber-cyan border-cyber-cyan/40 bg-cyber-blue/20' : 'text-neon-rose border-neon-rose/40 bg-neon-rose/20'
                }`}
              >
                {analytics.change_percent_vs_yesterday > 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {Math.abs(analytics.change_percent_vs_yesterday)}%
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-1 block">
            Baseline: {analytics?.yesterday_total_l.toFixed(1)} L yesterday
          </span>
        </div>

        <div className="liquid-glass liquid-sheen rounded-2xl p-5 border-l-4 border-l-neon-rose bento-card border-white/10 shadow-xl">
          <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest block mb-1">
            PEAK VELOCITY DEMAND
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">
              {analytics?.peak_usage_hour || 'N/A'}
            </span>
            <span className="text-xs font-mono font-bold text-neon-rose">
              ({analytics?.peak_flow_rate_lpm.toFixed(1)} L/min)
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-1 block">Highest instantaneous draw</span>
        </div>

        <div className="liquid-glass liquid-sheen rounded-2xl p-5 border-l-4 border-l-cyber-blue bento-card border-white/10 shadow-xl">
          <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest block mb-1">
            7-DAY CUMULATIVE VOL
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">
              {analytics ? formatVolume(analytics.last_7_days_total_l) : '0 L'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-1 block">
            Daily avg: {((analytics?.last_7_days_total_l || 0) / 7).toFixed(1)} L/day
          </span>
        </div>

        <div className="liquid-glass liquid-sheen rounded-2xl p-5 border-l-4 border-l-neon-rose bento-card border-white/10 shadow-xl">
          <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest block mb-1">
            PROJECTED MONTHLY TARIFF
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">
              {formatINR(analytics?.estimated_bill_inr || 0)}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-1 block">
            Estimated ~{analytics?.projected_month_l || 0} L consumption
          </span>
        </div>
      </div>

      {/* Main Charts: 24-Hour Diurnal Profile & 7-Day Volume Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 24-Hour Diurnal Profile */}
        <div className="liquid-glass liquid-sheen rounded-3xl p-6 border border-white/10 bento-card shadow-2xl">
          <div className="absolute top-3 right-3 skeuo-screw" />

          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyber-cyan" />
                24-HOUR DIURNAL USAGE PROFILE
              </h2>
              <p className="text-xs text-slate-400 font-mono">Hourly consumption aggregated over today</p>
            </div>
            <span className="brutalist-badge border-cyber-cyan text-cyber-cyan bg-black">
              HOURLY
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(5, 8, 17, 0.95)',
                    borderColor: '#00D2FF',
                    color: '#FFFFFF',
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                    boxShadow: '0 0 20px rgba(0, 210, 255, 0.3)',
                  }}
                  formatter={(val: any) => [`${val} Liters`, 'Hourly Volume']}
                />
                <Bar dataKey="liters" fill="#00D2FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7-Day Cumulative Trend */}
        <div className="liquid-glass liquid-sheen rounded-3xl p-6 border border-white/10 bento-card shadow-2xl">
          <div className="absolute top-3 right-3 skeuo-screw" />

          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neon-rose" />
                7-DAY CONSUMPTION HISTOGRAM
              </h2>
              <p className="text-xs text-slate-400 font-mono">Daily volume progression across previous week</p>
            </div>
            <span className="brutalist-badge border-neon-rose text-neon-rose bg-black">
              DAILY
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(5, 8, 17, 0.95)',
                    borderColor: '#FF007F',
                    color: '#FFFFFF',
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                    boxShadow: '0 0 20px rgba(255, 0, 127, 0.3)',
                  }}
                  formatter={(val: any) => [`${val} Liters`, 'Daily Total']}
                />
                <Bar dataKey="liters" fill="#FF007F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
