import React from 'react';
import { AlertTriangle, AlertCircle, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert } from '../../types';

interface AlertBannerProps {
  alerts: Alert[];
  onDismiss?: (id: number) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onDismiss }) => {
  const unresolved = alerts.filter((a) => !a.resolved);
  if (unresolved.length === 0) return null;

  const topAlert = unresolved[0];
  const isCritical = topAlert.severity === 'critical';

  return (
    <div
      className={`relative px-4 py-3 rounded-2xl border flex items-center justify-between gap-3 mb-6 transition-all liquid-glass ${
        isCritical
          ? 'liquid-glass-rose border-neon-rose/60 text-white shadow-[0_0_25px_rgba(255,0,127,0.4)]'
          : 'border-amber-500/50 bg-black/75 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
      }`}
    >
      <div className="flex items-center gap-3">
        {isCritical ? (
          <AlertCircle className="w-5 h-5 text-neon-rose shrink-0 animate-bounce drop-shadow-[0_0_8px_#FF007F]" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        )}
        <div className="text-xs">
          <span className="brutalist-badge mr-2 bg-black border-neon-rose text-neon-rose">
            {topAlert.alert_type}
          </span>
          <span className="font-extrabold text-white tracking-wide">{topAlert.title}</span>
          <span className="hidden md:inline text-xs text-slate-300 ml-2 font-mono"> — {topAlert.message}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Link
          to="/alerts"
          className="clay-pill px-3 py-1 text-[10px] font-black font-mono tracking-wider text-neon-rose border-neon-rose/40 hover:scale-105 transition-transform flex items-center gap-1.5"
        >
          VIEW ({unresolved.length}) <ExternalLink className="w-3 h-3" />
        </Link>
        {onDismiss && (
          <button
            onClick={() => onDismiss(topAlert.id)}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Acknowledge Alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
