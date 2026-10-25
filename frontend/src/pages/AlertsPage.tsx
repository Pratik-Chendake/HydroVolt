import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Bell,
  Check,
  RotateCcw,
  Plus,
  RefreshCw,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';
import { Alert } from '../types';
import { formatDateTime, formatFlow } from '../utils/formatters';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'critical' | 'warning' | 'info'>('ALL');
  const [filterResolved, setFilterResolved] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getAlerts(undefined, 100);
      setAlerts(data);
    } catch (err) {
      console.warn('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (id: number) => {
    try {
      await api.updateAlert(id, { acknowledged: true });
      fetchAlerts();
    } catch (err: any) {
      alert(`Error updating alert: ${err.message}`);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await api.updateAlert(id, { resolved: true, acknowledged: true });
      fetchAlerts();
    } catch (err: any) {
      alert(`Error updating alert: ${err.message}`);
    }
  };

  const handleTriggerTest = async () => {
    try {
      await api.triggerTestAlert();
      fetchAlerts();
    } catch (err: any) {
      alert(`Error triggering test alert: ${err.message}`);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (filterResolved === 'ACTIVE' && a.resolved) return false;
    if (filterResolved === 'RESOLVED' && !a.resolved) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-6 relative overflow-hidden bento-card border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute top-3 left-3 skeuo-screw hidden sm:block" />
        <div className="absolute top-3 right-3 skeuo-screw hidden sm:block" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="brutalist-badge border-neon-rose text-neon-rose bg-black">
              EVENT RADAR
            </span>
            <span className="brutalist-badge border-cyber-cyan text-cyber-cyan bg-black">
              SAFETY INTERLOCKS
            </span>
          </div>

          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight mt-2 flex items-center gap-2 font-mono">
            <AlertTriangle className="w-6 h-6 text-neon-rose animate-pulse drop-shadow-[0_0_8px_#FF007F]" />
            ALERTS &amp; EVENT NOTIFICATION COMMAND CENTER
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-mono">
            Real-time threshold monitoring &bull; Continuous leakage warnings &bull; Hardware status alarms
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <button
            onClick={handleTriggerTest}
            className="clay-pill-rose px-4 py-2 text-xs font-black font-mono tracking-wider text-white shadow-[0_0_15px_rgba(255,0,127,0.4)] flex items-center gap-1.5"
            title="Fire a diagnostic test alert to verify notifications"
          >
            <Plus className="w-4 h-4" />
            <span>DIAGNOSTIC ALARM</span>
          </button>

          <button
            onClick={fetchAlerts}
            className="p-2 rounded-2xl neomorph-btn text-slate-300 hover:text-cyber-cyan border-white/10"
            title="Refresh Alerts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Ribbon (Bento) */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono border border-white/10 shadow-xl">
        {/* Severity filter */}
        <div className="flex items-center gap-1.5 p-1 bg-black/80 rounded-2xl border border-white/10">
          {(['ALL', 'critical', 'warning', 'info'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-xl font-black font-mono uppercase tracking-wider transition-all ${
                filterSeverity === sev
                  ? 'clay-pill-rose text-white shadow-[0_0_15px_rgba(255,0,127,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Resolution filter */}
        <div className="flex items-center gap-1.5 p-1 bg-black/80 rounded-2xl border border-white/10">
          {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterResolved(st)}
              className={`px-3 py-1 rounded-xl font-black font-mono tracking-wider transition-all ${
                filterResolved === st
                  ? 'clay-pill-blue text-white shadow-[0_0_15px_rgba(0,210,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 font-mono">
        {filteredAlerts.length === 0 ? (
          <div className="liquid-glass liquid-sheen rounded-3xl p-12 text-center text-slate-400 border border-white/10 shadow-2xl">
            <CheckCircle className="w-12 h-12 text-cyber-cyan mx-auto mb-3 drop-shadow-[0_0_12px_#00D2FF]" />
            <h3 className="text-base font-black text-white mb-1 font-mono">ALL SYSTEMS NOMINAL &bull; ZERO ACTIVE HAZARDS</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-mono">
              Telemetry parameters are operating within safety bounds. No continuous leakage or pipe rupture anomalies detected.
            </p>
          </div>
        ) : (
          filteredAlerts.map((a) => {
            const isCritical = a.severity === 'critical';
            const isWarning = a.severity === 'warning';

            return (
              <div
                key={a.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 bento-card relative overflow-hidden ${
                  a.resolved
                    ? 'liquid-glass border-white/5 opacity-50'
                    : isCritical
                    ? 'liquid-glass-rose border-neon-rose/60 shadow-[0_0_25px_rgba(255,0,127,0.35)]'
                    : isWarning
                    ? 'liquid-glass border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    : 'liquid-glass border-white/10'
                }`}
              >
                <div className="absolute top-2.5 right-2.5 skeuo-screw" />

                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-2xl border backdrop-blur-md shrink-0 mt-0.5 ${
                      isCritical
                        ? 'bg-neon-rose/20 text-neon-rose border-neon-rose/40 shadow-[0_0_12px_rgba(255,0,127,0.5)]'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        : 'bg-cyber-blue/20 text-cyber-cyan border-cyber-cyan/40'
                    }`}
                  >
                    {isCritical ? (
                      <AlertCircle className="w-5 h-5 animate-bounce" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="brutalist-badge text-[9px] py-0 px-1.5 border-neon-rose text-neon-rose">
                        {a.alert_type}
                      </span>
                      <span className="text-sm font-black text-white tracking-wide">{a.title}</span>
                      {a.flow_rate_observed && (
                        <span className="text-xs font-mono text-neon-rose font-black">
                          ({formatFlow(a.flow_rate_observed)})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{a.message}</p>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyber-cyan" /> {formatDateTime(a.timestamp)}
                      </span>
                      <span>&bull;</span>
                      <span>{a.acknowledged ? 'ACKNOWLEDGED' : 'PENDING REVIEW'}</span>
                      <span>&bull;</span>
                      <span className={a.resolved ? 'text-cyber-cyan font-bold' : 'text-neon-rose font-bold'}>
                        {a.resolved ? 'RESOLVED' : 'ACTIVE EVENT'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {!a.acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(a.id)}
                      className="clay-pill px-3 py-1.5 text-xs font-black font-mono text-slate-300 hover:text-white border-white/10"
                    >
                      ACKNOWLEDGE
                    </button>
                  )}
                  {!a.resolved && (
                    <button
                      onClick={() => handleResolve(a.id)}
                      className="clay-pill-blue px-3.5 py-1.5 text-xs font-black font-mono text-white flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,210,255,0.4)]"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>RESOLVE</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
