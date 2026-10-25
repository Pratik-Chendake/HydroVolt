import React from 'react';

interface StatusBadgeProps {
  status: string;
  isSimulated?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isSimulated, className = '' }) => {
  let badgeClasses = 'clay-pill bg-obsidian-900/90 text-slate-300 border-white/10';
  let dotColor = 'bg-slate-400';
  let dotShadow = 'shadow-none';
  let label = status;
  let pulse = false;

  const normalized = status.toUpperCase();

  if (isSimulated || normalized.includes('SIMULAT')) {
    badgeClasses = 'clay-pill border-neon-rose/40 text-neon-rose bg-black/60 shadow-[0_0_12px_rgba(255,0,127,0.3)]';
    dotColor = 'bg-neon-rose';
    dotShadow = 'shadow-[0_0_8px_#FF007F]';
    label = 'TEST SIMULATOR';
    pulse = true;
  } else if (normalized === 'ONLINE' || normalized === 'OK' || normalized === 'CONNECTED') {
    badgeClasses = 'clay-pill border-cyber-cyan/40 text-cyber-cyan bg-black/60 shadow-[0_0_12px_rgba(0,210,255,0.3)]';
    dotColor = 'bg-cyber-cyan';
    dotShadow = 'shadow-[0_0_8px_#00D2FF]';
    label = 'HARDWARE LIVE';
    pulse = true;
  } else if (normalized.includes('WARN')) {
    badgeClasses = 'clay-pill border-amber-500/40 text-amber-300 bg-black/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]';
    dotColor = 'bg-amber-400';
    dotShadow = 'shadow-[0_0_8px_#F59E0B]';
  } else if (normalized.includes('ERR') || normalized === 'CRITICAL') {
    badgeClasses = 'clay-pill border-neon-rose/60 text-white bg-neon-rose/25 shadow-[0_0_15px_rgba(255,0,127,0.5)]';
    dotColor = 'bg-white';
    dotShadow = 'shadow-[0_0_10px_#FFFFFF]';
    pulse = true;
  } else if (normalized.includes('NOT CONFIG') || normalized.includes('DISCONNECT') || normalized === 'OFFLINE') {
    badgeClasses = 'clay-pill border-white/10 text-slate-400 bg-black/50';
    dotColor = 'bg-slate-500';
    label = normalized.includes('NOT CONFIG') ? 'NOT CONFIGURED' : 'OFFLINE';
  }

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase font-mono tracking-wider ${badgeClasses} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor} ${dotShadow}`} />
      </span>
      {label}
    </span>
  );
};
