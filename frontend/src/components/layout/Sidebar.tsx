import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Droplets,
  History,
  TrendingUp,
  AlertTriangle,
  Cpu,
  Usb,
  Sliders,
  Zap,
  Receipt,
  FileSpreadsheet,
  BrainCircuit,
  Settings,
  HelpCircle,
  X,
  Radio,
  Flame,
} from 'lucide-react';
import { LiveWaterStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  status: LiveWaterStatus | null;
}

interface NavItem {
  name: string;
  path: string;
  icon: any;
  tag?: string;
  badge?: number;
  isRose?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, status }) => {
  const navigationGroups: NavGroup[] = [
    {
      group: 'Telemetry & Ops',
      items: [
        { name: 'Home Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Water Monitoring', path: '/monitoring', icon: Droplets, isRose: true },
        { name: 'Water History', path: '/history', icon: History },
        { name: 'Analytics & Trends', path: '/analytics', icon: TrendingUp },
        { name: 'Alerts & Events', path: '/alerts', icon: AlertTriangle, badge: status?.recent_alert_count, isRose: true },
      ],
    },
    {
      group: 'Hardware & Calibration',
      items: [
        { name: 'Device Management', path: '/devices', icon: Cpu },
        { name: 'Arduino Serial Config', path: '/arduino-config', icon: Usb },
        { name: 'Sensor Calibration', path: '/calibration', icon: Sliders },
        { name: 'Electricity Meter Setup', path: '/electricity', icon: Zap, tag: 'Disabled' },
      ],
    },
    {
      group: 'Intelligence & Tariffs',
      items: [
        { name: 'Billing & Tariffs', path: '/tariffs', icon: Receipt },
        { name: 'Reports & Exports', path: '/reports', icon: FileSpreadsheet },
        { name: 'AI Insights', path: '/ai-insights', icon: BrainCircuit, tag: 'Neural', isRose: true },
      ],
    },
    {
      group: 'System Control',
      items: [
        { name: 'Settings', path: '/settings', icon: Settings },
        { name: 'Help & Hardware Setup', path: '/help', icon: HelpCircle },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-black/65 backdrop-blur-2xl border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Skeuomorphic corner rivet decoration */}
        <div className="absolute top-2.5 left-2.5 skeuo-screw hidden lg:block" />
        <div className="absolute top-2.5 right-2.5 skeuo-screw hidden lg:block" />

        {/* Brand header */}
        <div className="h-18 px-6 border-b border-white/10 flex items-center justify-between relative overflow-hidden bg-gradient-to-r from-black/80 via-obsidian-900/60 to-black/80">
          {/* Subtle Cyber Glow Sheen */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />

          <div className="flex items-center gap-3">
            {/* Claymorphic 3D Logo Icon */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyber-cyan via-cyber-blue to-neon-rose p-[1.5px] shadow-lg shadow-cyber-blue/30">
              <div className="w-full h-full rounded-[14px] bg-black/90 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-cyber-cyan drop-shadow-[0_0_8px_rgba(0,210,255,0.8)]" />
              </div>
            </div>

            <div>
              <div className="text-sm font-black tracking-tight text-white flex items-center gap-1.5 font-mono">
                HYDO<span className="cyber-gradient-text font-black">VOLT</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="brutalist-badge text-[9px] py-0 px-1 border-neon-rose text-neon-rose">IOT.OS</span>
                <span className="text-[10px] font-mono text-slate-400 tracking-wider">AI TELEMETRY</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {navigationGroups.map((grp) => (
            <div key={grp.group}>
              <div className="px-3 mb-2 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
                  {grp.group}
                </span>
                <span className="w-8 h-[1px] bg-white/10" />
              </div>

              <div className="space-y-1">
                {grp.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `relative group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? item.isRose
                            ? 'liquid-glass-rose text-white border-neon-rose/60 shadow-[0_0_20px_-3px_rgba(255,0,127,0.45)]'
                            : 'liquid-glass-blue text-white border-cyber-cyan/60 shadow-[0_0_20px_-3px_rgba(0,210,255,0.45)]'
                          : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <item.icon
                            className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                              isActive
                                ? item.isRose
                                  ? 'text-neon-rose drop-shadow-[0_0_8px_rgba(255,0,127,0.8)]'
                                  : 'text-cyber-cyan drop-shadow-[0_0_8px_rgba(0,210,255,0.8)]'
                                : 'text-slate-400 group-hover:text-cyber-cyan'
                            }`}
                          />
                          <span className={isActive ? 'font-bold' : 'font-medium'}>{item.name}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {item.tag && (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold tracking-wider ${
                                item.tag === 'Disabled'
                                  ? 'bg-obsidian-850 text-slate-400 border border-white/10'
                                  : 'bg-neon-rose/20 text-neon-rose border border-neon-rose/40'
                              }`}
                            >
                              {item.tag}
                            </span>
                          )}

                          {item.badge && item.badge > 0 ? (
                            <span className="px-1.5 py-0.5 rounded-full bg-neon-rose text-white text-[10px] font-black font-mono shadow-[0_0_10px_rgba(255,0,127,0.8)] animate-pulse">
                              {item.badge}
                            </span>
                          ) : null}
                        </div>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Skeuomorphic Hardware Status Footer */}
        <div className="p-4 border-t border-white/10 bg-black/80 backdrop-blur-md relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {/* Tactile Hardware Blinking LED Diode */}
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyber-cyan shadow-[0_0_8px_#00D2FF]" />
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-300">
                PORT: <span className="text-cyber-cyan">{status?.port || 'COM3'}</span>
              </span>
            </div>

            <StatusBadge
              status={status?.sensor_status || 'OFFLINE'}
              isSimulated={status?.is_simulated}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-white/5">
            <span>BAUD: {status?.baud_rate || 9600}</span>
            <span className="flex items-center gap-1">
              STATUS: <strong className="text-neon-rose font-bold">{status?.connected ? 'SYNCED' : 'STANDBY'}</strong>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
