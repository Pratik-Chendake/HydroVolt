import React, { useState, useEffect } from 'react';
import { Menu, Play, Square, Activity, Bell, RefreshCw, Radio, Sparkles, Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LiveWaterStatus } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';

interface HeaderProps {
  onToggleSidebar: () => void;
  status: LiveWaterStatus | null;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, status, onRefresh }) => {
  const [isTogglingSim, setIsTogglingSim] = useState(false);
  const [clock, setClock] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSimulation = async () => {
    try {
      setIsTogglingSim(true);
      if (status?.is_simulated) {
        await api.stopSimulation();
      } else {
        await api.startSimulation();
      }
      onRefresh();
    } catch (err: any) {
      alert(`Simulation toggle error: ${err.message}`);
    } finally {
      setIsTogglingSim(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-18 bg-black/60 backdrop-blur-2xl border-b border-white/10 px-4 lg:px-8 flex items-center justify-between transition-colors shadow-2xl relative">
      {/* Top Specular Fluid Sheen Reflection */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

      {/* Left: Mobile hamburger & Real-time Live Ticker */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Live HUD Telemetry Pill (Glassmorphic + Brutalist Mono) */}
        <div className="hidden sm:flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-obsidian-900/80 border border-white/10 text-xs font-mono shadow-inner">
            <Radio className="w-3.5 h-3.5 text-cyber-cyan animate-pulse drop-shadow-[0_0_6px_#00D2FF]" />
            <span className="text-slate-400 text-[11px] font-bold">FLOW:</span>
            <span className="font-extrabold text-white font-mono">
              {status ? `${status.flow_rate_lpm.toFixed(2)}` : '0.00'}
              <span className="text-cyber-cyan text-[10px] ml-1">L/MIN</span>
            </span>

            <span className="text-white/20">|</span>

            <span className="text-slate-400 text-[11px] font-bold">ACCUM:</span>
            <span className="font-extrabold text-neon-rose font-mono">
              {status ? `${status.total_liters.toFixed(1)}` : '0.0'}
              <span className="text-neon-rose/80 text-[10px] ml-1">L</span>
            </span>
          </div>

          {/* Spatial Live Beacon */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-cyber-blue/30 text-[10px] font-mono text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-ping" />
            <span>LIVE BUS 9600</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Claymorphic 3D Quick Simulator Toggle Button */}
        <button
          onClick={handleToggleSimulation}
          disabled={isTogglingSim}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-mono tracking-wide transition-all ${
            status?.is_simulated
              ? 'clay-pill-rose text-white shadow-[0_0_20px_rgba(255,0,127,0.5)]'
              : 'neomorph-btn text-slate-200 hover:text-white border-white/15'
          }`}
          title={status?.is_simulated ? 'Stop Simulator Telemetry' : 'Launch Deterministic Test Simulator'}
        >
          {status?.is_simulated ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current text-white animate-pulse" />
              <span>SIMULATOR ACTIVE</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current text-cyber-cyan drop-shadow-[0_0_6px_#00D2FF]" />
              <span>RUN TEST SIM</span>
            </>
          )}
        </button>

        {/* Status Badge */}
        <StatusBadge
          status={status?.sensor_status || 'OFFLINE'}
          isSimulated={status?.is_simulated}
          className="hidden md:inline-flex"
        />

        {/* Refresh button with Neomorphic Touch */}
        <button
          onClick={onRefresh}
          className="p-2.5 rounded-xl neomorph-btn text-slate-300 hover:text-cyber-cyan border-white/10 transition-all hover:scale-105"
          title="Refresh Telemetry Bus"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Alert Bell with Neon Rose Glow */}
        <Link
          to="/alerts"
          className="relative p-2.5 rounded-xl neomorph-btn text-slate-300 hover:text-neon-rose border-white/10 transition-all hover:scale-105"
          title="View System Alerts"
        >
          <Bell className="w-4 h-4" />
          {status && status.recent_alert_count > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-neon-rose shadow-[0_0_8px_#FF007F] animate-ping" />
          )}
        </Link>

        {/* Supabase Cloud Live Indicator */}
        <Link
          to="/settings"
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-obsidian-950/90 border border-cyber-cyan/30 font-mono text-xs text-cyber-cyan hover:border-cyber-cyan transition-colors shadow-inner"
          title="Supabase PostgreSQL Cloud: escefqdmzcqcfbgqwjil.supabase.co"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan shadow-[0_0_6px_#00D2FF] animate-pulse" />
          <Cloud className="w-3.5 h-3.5" />
          <span>SUPABASE</span>
        </Link>

        {/* Brutalist IST Clock Box */}
        <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-obsidian-950/90 border border-white/10 font-mono text-xs shadow-inner">
          <span className="text-[10px] uppercase font-bold text-slate-400">IST:</span>
          <span className="font-extrabold text-white tracking-wider">{clock || '--:--:--'}</span>
        </div>
      </div>
    </header>
  );
};
