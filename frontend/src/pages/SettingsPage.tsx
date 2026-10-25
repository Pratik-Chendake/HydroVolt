import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Sliders,
  Bell,
  Clock,
  Database,
  Trash2,
  RefreshCw,
  Sun,
  Moon,
  Palette,
  Laptop,
  Video,
  Sparkles,
  Cloud,
  Check,
  Copy,
  ExternalLink,
  ArrowRight,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { checkSupabaseConnection, SupabaseHealth } from '../services/supabase';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [currency, setCurrency] = useState(() => localStorage.getItem('hydovolt_currency') || '₹');
  const [timezone, setTimezone] = useState(() => localStorage.getItem('hydovolt_timezone') || 'Asia/Kolkata (IST UTC+05:30)');
  const [pollingMode, setPollingMode] = useState('WebSocket (Instant Push)');
  const [dataRetentionDays, setDataRetentionDays] = useState(() => {
    const saved = localStorage.getItem('hydovolt_retention');
    return saved ? parseInt(saved) : 90;
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Supabase Cloud State
  const [supabaseHealth, setSupabaseHealth] = useState<SupabaseHealth | null>(null);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [syncingSupabase, setSyncingSupabase] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    testSupabase();
  }, []);

  const testSupabase = async () => {
    try {
      setTestingSupabase(true);
      const res = await checkSupabaseConnection();
      setSupabaseHealth(res);
    } catch (err: any) {
      setSupabaseHealth({
        connected: false,
        projectRef: 'escefqdmzcqcfbgqwjil',
        url: 'https://escefqdmzcqcfbgqwjil.supabase.co',
        tablesDetected: [],
        message: err.message,
      });
    } finally {
      setTestingSupabase(false);
    }
  };

  const handleSyncToSupabase = async () => {
    try {
      setSyncingSupabase(true);
      setSyncResult(null);
      const res = await api.syncAllToSupabase();
      setSyncResult(res.message);
      testSupabase();
    } catch (err: any) {
      setSyncResult(`Sync notice: ${err.message}. If tables are missing, run supabase_schema.sql in Supabase SQL Editor.`);
    } finally {
      setSyncingSupabase(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem('hydovolt_currency', currency);
    localStorage.setItem('hydovolt_timezone', timezone);
    localStorage.setItem('hydovolt_retention', dataRetentionDays.toString());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-6 relative overflow-hidden bento-card border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="absolute top-3 left-3 skeuo-screw hidden sm:block" />
        <div className="absolute top-3 right-3 skeuo-screw hidden sm:block" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="brutalist-badge border-cyber-cyan text-cyber-cyan bg-black">
              CONFIGURATION ENGINE
            </span>
            <span className="brutalist-badge border-neon-rose text-neon-rose bg-black">
              SUPABASE CLOUD ACTIVE
            </span>
          </div>

          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight mt-2 flex items-center gap-2 font-mono">
            <Settings className="w-6 h-6 text-neon-rose animate-pulse drop-shadow-[0_0_8px_#FF007F]" />
            SYSTEM SETTINGS &amp; SUPABASE CLOUD PREFERENCES
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-mono">
            Supabase real-time cloud sync &bull; Cinematic video background &bull; Black, Blue &amp; Neon Rose spatial palette
          </p>
        </div>

        {savedSuccess && (
          <div className="relative z-10 clay-pill-rose px-4 py-2 text-xs font-mono font-bold text-white flex items-center gap-2 shadow-[0_0_20px_rgba(255,0,127,0.5)]">
            <CheckCircle2 className="w-4 h-4" />
            <span>PREFERENCES PERSISTED</span>
          </div>
        )}
      </div>

      {/* =========================================================================
          SUPABASE CLOUD INTEGRATION CARD (BENTO)
          ========================================================================= */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-6 space-y-5 border border-cyber-cyan/40 bento-card shadow-2xl relative overflow-hidden">
        <div className="absolute top-3 right-3 skeuo-screw" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyber-blue/20 text-cyber-cyan border border-cyber-cyan/40 shadow-[0_0_15px_rgba(0,210,255,0.4)]">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-white font-mono">
                  SUPABASE POSTGRESQL &amp; REALTIME CLOUD INTEGRATION
                </h2>
                <span className="brutalist-badge text-[9px] py-0 px-1 border-cyber-cyan text-cyber-cyan">
                  CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Cloud telemetry replication, PostgREST endpoints &amp; Row Level Security
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={testSupabase}
              disabled={testingSupabase}
              className="clay-pill px-3.5 py-1.5 text-xs font-black font-mono text-cyber-cyan border-cyber-cyan/30 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingSupabase ? 'animate-spin' : ''}`} />
              <span>TEST HANDSHAKE</span>
            </button>
          </div>
        </div>

        {/* Supabase Connection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3.5 rounded-2xl bg-black/70 border border-white/10 shadow-inner">
            <span className="text-[10px] text-slate-400 block font-bold mb-1">SUPABASE URL</span>
            <span className="text-cyber-cyan font-black break-all text-[11px]">
              https://escefqdmzcqcfbgqwjil.supabase.co
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/70 border border-white/10 shadow-inner">
            <span className="text-[10px] text-slate-400 block font-bold mb-1">PROJECT REFERENCE</span>
            <span className="text-white font-black text-sm">escefqdmzcqcfbgqwjil</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/70 border border-white/10 shadow-inner">
            <span className="text-[10px] text-slate-400 block font-bold mb-1">API AUTH ROLES</span>
            <span className="text-neon-rose font-bold text-xs">
              service_role (Backend) &bull; anon (Frontend)
            </span>
          </div>
        </div>

        {/* Sync message output */}
        {syncResult && (
          <div className="p-3.5 rounded-2xl bg-black/80 border border-cyber-cyan/40 text-xs font-mono text-cyber-cyan flex items-start gap-2 shadow-inner">
            <Info className="w-4 h-4 text-cyber-cyan shrink-0 mt-0.5" />
            <span>{syncResult}</span>
          </div>
        )}

        {/* Actions Bar */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncToSupabase}
              disabled={syncingSupabase}
              className="clay-pill-blue px-4 py-2 text-xs font-black font-mono tracking-wider text-white shadow-[0_0_15px_rgba(0,210,255,0.4)] flex items-center gap-2"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{syncingSupabase ? 'SYNCHRONIZING...' : 'SYNC ALL LOCAL RECORDS TO SUPABASE'}</span>
            </button>

            <a
              href="https://supabase.com/dashboard/project/escefqdmzcqcfbgqwjil/sql"
              target="_blank"
              rel="noreferrer"
              className="clay-pill px-4 py-2 text-xs font-black font-mono tracking-wider text-slate-300 hover:text-white border-white/15 flex items-center gap-1.5"
            >
              <span>OPEN SUPABASE SQL EDITOR</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Schema script: <code className="text-neon-rose font-bold">supabase_schema.sql</code> in root
          </div>
        </div>
      </div>

      {/* Visual Theme Card (Bento) */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-6 space-y-4 border border-white/10 bento-card shadow-2xl">
        <div className="absolute top-3 right-3 skeuo-screw" />

        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-cyber-cyan" />
          <h2 className="text-xs font-black uppercase tracking-wider text-white font-mono">
            VISUAL APPEARANCE &amp; SPATIAL BACKDROP
          </h2>
        </div>
        <p className="text-xs text-slate-300 font-mono">
          Featuring ambient looping video background in dark effect, liquid glass refraction, and neon rose &amp; electric blue telemetry.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Cyber Dark Option */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all ${
              theme === 'dark'
                ? 'liquid-glass-rose border-neon-rose text-white shadow-[0_0_30px_rgba(255,0,127,0.4)]'
                : 'liquid-glass border-white/10 text-slate-300 hover:border-white/20'
            }`}
          >
            <div className="p-3 rounded-xl bg-neon-rose/20 text-neon-rose border border-neon-rose/40 shadow-[0_0_12px_rgba(255,0,127,0.5)]">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white font-mono flex items-center gap-2">
                DARK EFFECT + VIDEO BG
                {theme === 'dark' && (
                  <span className="brutalist-badge text-[9px] py-0 px-1 border-neon-rose text-neon-rose">ACTIVE</span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Black, Electric Blue &amp; Neon Rose with live looping video
              </div>
            </div>
          </button>

          {/* Minimal Light Option */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border flex items-center gap-4 text-left transition-all ${
              theme === 'light'
                ? 'liquid-glass-blue border-cyber-cyan text-white shadow-[0_0_30px_rgba(0,210,255,0.4)]'
                : 'liquid-glass border-white/10 text-slate-300 hover:border-white/20'
            }`}
          >
            <div className="p-3 rounded-xl bg-cyber-blue/20 text-cyber-cyan border border-cyber-cyan/40">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-white font-mono flex items-center gap-2">
                HIGH-CONTRAST LIGHT
                {theme === 'light' && (
                  <span className="brutalist-badge text-[9px] py-0 px-1 border-cyber-cyan text-cyber-cyan">ACTIVE</span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Clean daylight slate canvas with teal accents
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Regional & System Settings Form (Bento) */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-6 space-y-6 border border-white/10 bento-card shadow-2xl">
        <div className="absolute top-3 right-3 skeuo-screw" />

        <h2 className="text-xs font-black uppercase tracking-wider text-white font-mono">
          REGIONAL &amp; TELEMETRY BUS PARAMETERS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              CURRENCY SYMBOL
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-black/80 border border-white/15 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyber-cyan shadow-inner"
            >
              <option value="₹">₹ - Indian Rupee (INR)</option>
              <option value="$">$ - US Dollar (USD)</option>
              <option value="€">€ - Euro (EUR)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              SYSTEM TIMEZONE
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-black/80 border border-white/15 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyber-cyan shadow-inner"
            >
              <option value="Asia/Kolkata (IST UTC+05:30)">Asia/Kolkata (IST UTC+05:30)</option>
              <option value="UTC (Coordinated Universal Time)">UTC (Coordinated Universal Time)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              TELEMETRY TRANSPORT METHOD
            </label>
            <select
              value={pollingMode}
              onChange={(e) => setPollingMode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-black/80 border border-white/15 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyber-cyan shadow-inner"
            >
              <option value="WebSocket (Instant Push)">WebSocket /ws/live (Real-time Broadcast)</option>
              <option value="HTTP Polling (2-Second Heartbeat)">HTTP Polling Fallback (2-Second Ticks)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              TELEMETRY DATA RETENTION
            </label>
            <select
              value={dataRetentionDays}
              onChange={(e) => setDataRetentionDays(parseInt(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-black/80 border border-white/15 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyber-cyan shadow-inner"
            >
              <option value={30}>30 Days</option>
              <option value={90}>90 Days (Recommended)</option>
              <option value={365}>1 Year</option>
              <option value={9999}>Indefinite Retention</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex justify-end">
          <button
            onClick={handleSave}
            className="clay-pill-rose px-6 py-2.5 text-xs font-black font-mono tracking-wider text-white shadow-[0_0_20px_rgba(255,0,127,0.5)] flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>PERSIST SETTINGS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
