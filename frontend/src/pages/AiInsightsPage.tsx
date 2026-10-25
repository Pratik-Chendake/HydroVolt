import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { api } from '../services/api';
import { AIInsightsResponse } from '../types';
import { formatVolume, formatDateTime } from '../utils/formatters';

export const AiInsightsPage: React.FC = () => {
  const [insightsData, setInsightsData] = useState<AIInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAIInsights()
      .then(setInsightsData)
      .catch((err) => console.warn('AI insights fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-6 relative overflow-hidden bento-card border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute top-3 left-3 skeuo-screw hidden sm:block" />
        <div className="absolute top-3 right-3 skeuo-screw hidden sm:block" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="brutalist-badge border-neon-rose text-neon-rose bg-black">
              NEURAL INFERENCE ENGINE
            </span>
            <span className="brutalist-badge border-cyber-cyan text-cyber-cyan bg-black">
              LOCAL DETERMINISTIC
            </span>
          </div>

          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight mt-2 flex items-center gap-2 font-mono">
            <BrainCircuit className="w-6 h-6 text-neon-rose animate-pulse drop-shadow-[0_0_8px_#FF007F]" />
            EXPLAINABLE AI &amp; STATISTICAL TELEMETRY INSIGHTS
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-mono">
            Data-driven leak heuristics &bull; Minimum Night Flow (MNF) analysis &bull; Zero external API dependencies
          </p>
        </div>

        <div className="relative z-10">
          <div className="clay-pill-rose px-4 py-2 text-xs font-mono font-bold text-white border-white/20 flex items-center gap-2 shadow-[0_0_15px_rgba(255,0,127,0.4)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MODEL: {insightsData?.status || 'STATISTICAL MATRIX'}</span>
          </div>
        </div>
      </div>

      {/* Model Metadata Bar */}
      <div className="p-4 rounded-2xl liquid-glass border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono shadow-inner">
        <div className="flex items-center gap-2 text-slate-300">
          <Info className="w-4 h-4 text-cyber-cyan shrink-0" />
          <span>
            Evaluated <strong className="text-white font-bold">{insightsData?.total_data_points_analyzed || 0}</strong> historical telemetry records across{' '}
            <strong className="text-cyber-cyan font-bold">{insightsData?.time_range_evaluated || 'Past 30 Days'}</strong>.
          </span>
        </div>

        <div className="text-slate-400">
          GENERATED: {insightsData ? formatDateTime(insightsData.generated_at) : 'LIVE BUS'}
        </div>
      </div>

      {/* Primary Insights Feed */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-300 font-mono flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyber-cyan" />
          DIAGNOSTIC FINDINGS &amp; ANOMALY SIGNALS
        </h2>

        {insightsData?.insights.map((item) => {
          const isWarning = item.severity === 'warning';
          const isSuccess = item.severity === 'success';

          return (
            <div
              key={item.id}
              className={`p-6 rounded-3xl border transition-all bento-card relative overflow-hidden ${
                isWarning
                  ? 'liquid-glass-rose border-neon-rose/50 shadow-[0_0_25px_rgba(255,0,127,0.3)]'
                  : isSuccess
                  ? 'liquid-glass-blue border-cyber-cyan/50 shadow-[0_0_25px_rgba(0,210,255,0.3)]'
                  : 'liquid-glass border-white/10'
              }`}
            >
              <div className="absolute top-3 right-3 skeuo-screw" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-2xl border backdrop-blur-md ${
                      isWarning
                        ? 'bg-neon-rose/20 text-neon-rose border-neon-rose/40 shadow-[0_0_12px_rgba(255,0,127,0.5)]'
                        : isSuccess
                        ? 'bg-cyber-blue/20 text-cyber-cyan border-cyber-cyan/40 shadow-[0_0_12px_rgba(0,210,255,0.5)]'
                        : 'bg-black/60 text-slate-300 border-white/10'
                    }`}
                  >
                    {isWarning ? (
                      <AlertTriangle className="w-5 h-5 animate-pulse" />
                    ) : isSuccess ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Lightbulb className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`brutalist-badge text-[9px] py-0 px-1.5 ${
                          isWarning ? 'border-neon-rose text-neon-rose' : 'border-cyber-cyan text-cyber-cyan'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        CONFIDENCE: {(item.confidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-white tracking-wide font-mono">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-mono relative z-10">
                {item.description}
              </p>

              {item.evidence && (
                <div className="mt-4 p-3.5 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs text-slate-300 space-y-1 relative z-10 shadow-inner">
                  <div className="text-[10px] font-black text-neon-rose uppercase tracking-wider">
                    EVIDENCE TRACE:
                  </div>
                  <div>{item.evidence}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
