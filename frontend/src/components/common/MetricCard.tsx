import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: number;
    isPositiveGood?: boolean;
    label?: string;
  };
  accentColor?: 'cyan' | 'aqua' | 'emerald' | 'amber' | 'blue' | 'rose';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  subtitle,
  trend,
  accentColor = 'blue',
  className = '',
}) => {
  const accentClasses = {
    rose: {
      iconBg: 'bg-neon-rose/15 border-neon-rose/40 text-neon-rose shadow-[0_0_15px_rgba(255,0,127,0.35)]',
      glow: 'from-neon-rose/20 to-transparent',
      borderHover: 'hover:border-neon-rose/50',
      valueColor: 'text-white drop-shadow-[0_0_12px_rgba(255,0,127,0.3)]',
      unitColor: 'text-neon-rose font-bold',
    },
    blue: {
      iconBg: 'bg-cyber-blue/15 border-cyber-cyan/40 text-cyber-cyan shadow-[0_0_15px_rgba(0,210,255,0.35)]',
      glow: 'from-cyber-blue/20 to-transparent',
      borderHover: 'hover:border-cyber-cyan/50',
      valueColor: 'text-white drop-shadow-[0_0_12px_rgba(0,210,255,0.3)]',
      unitColor: 'text-cyber-cyan font-bold',
    },
    cyan: {
      iconBg: 'bg-cyber-cyan/15 border-cyber-cyan/40 text-cyber-cyan shadow-[0_0_15px_rgba(0,210,255,0.35)]',
      glow: 'from-cyber-cyan/20 to-transparent',
      borderHover: 'hover:border-cyber-cyan/50',
      valueColor: 'text-white drop-shadow-[0_0_12px_rgba(0,210,255,0.3)]',
      unitColor: 'text-cyber-cyan font-bold',
    },
    aqua: {
      iconBg: 'bg-teal-500/15 border-teal-400/40 text-teal-300 shadow-[0_0_15px_rgba(32,178,170,0.3)]',
      glow: 'from-teal-500/20 to-transparent',
      borderHover: 'hover:border-teal-400/50',
      valueColor: 'text-white',
      unitColor: 'text-teal-300 font-bold',
    },
    emerald: {
      iconBg: 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      glow: 'from-emerald-500/20 to-transparent',
      borderHover: 'hover:border-emerald-400/50',
      valueColor: 'text-white',
      unitColor: 'text-emerald-300 font-bold',
    },
    amber: {
      iconBg: 'bg-amber-500/15 border-amber-400/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
      glow: 'from-amber-500/20 to-transparent',
      borderHover: 'hover:border-amber-400/50',
      valueColor: 'text-white',
      unitColor: 'text-amber-300 font-bold',
    },
  }[accentColor];

  return (
    <div
      className={`liquid-glass liquid-sheen bento-card relative rounded-2xl p-5 overflow-hidden transition-all duration-300 ${accentClasses.borderHover} ${className}`}
    >
      {/* Skeuomorphic corner rivet */}
      <div className="absolute top-2.5 right-2.5 skeuo-screw opacity-60" />

      {/* Atmospheric Spatial Corner Radial Glow */}
      <div className={`absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-bl ${accentClasses.glow} rounded-full pointer-events-none filter blur-xl opacity-75`} />

      {/* Card Header: Title & Claymorphic Icon Badge */}
      <div className="flex items-center justify-between mb-3.5 relative z-10">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 font-mono">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border backdrop-blur-md transition-transform duration-200 hover:scale-105 ${accentClasses.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Primary Value with High-Contrast Brutalist Typography */}
      <div className="flex items-baseline gap-2 relative z-10">
        <span className={`text-2xl lg:text-3xl font-black tracking-tight font-mono ${accentClasses.valueColor}`}>
          {value}
        </span>
        {unit && (
          <span className={`text-xs uppercase tracking-wider font-mono ${accentClasses.unitColor}`}>
            {unit}
          </span>
        )}
      </div>

      {/* Footer Info & Claymorphic Trend Badge */}
      <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 relative z-10 font-mono">
        {subtitle && <span className="text-[11px] truncate max-w-[150px]">{subtitle}</span>}
        
        {trend && (
          <span
            className={`clay-pill px-2.5 py-0.5 text-[10px] font-black tracking-wide flex items-center gap-1 ${
              (trend.value >= 0 && trend.isPositiveGood) || (trend.value <= 0 && !trend.isPositiveGood)
                ? 'text-cyber-cyan border-cyber-cyan/30 bg-cyber-blue/20'
                : 'text-neon-rose border-neon-rose/30 bg-neon-rose/20'
            }`}
          >
            {trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`}
            {trend.label && <span className="text-slate-400 text-[9px] font-normal">{trend.label}</span>}
          </span>
        )}
      </div>
    </div>
  );
};
