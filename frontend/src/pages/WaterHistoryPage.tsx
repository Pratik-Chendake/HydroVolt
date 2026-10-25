import React, { useState, useEffect } from 'react';
import {
  History,
  Download,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import { WaterReading } from '../types';
import { formatDateTime, formatFlow } from '../utils/formatters';

export const WaterHistoryPage: React.FC = () => {
  const [readings, setReadings] = useState<WaterReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'HW' | 'SIM'>('ALL');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getWaterHistory({
        skip: page * pageSize,
        limit: pageSize,
        start_date: startDate ? new Date(startDate).toISOString() : undefined,
        end_date: endDate ? new Date(endDate).toISOString() : undefined,
      });
      setReadings(data);
    } catch (err) {
      console.warn('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, startDate, endDate]);

  const handleDownloadCsv = () => {
    const url = api.getDownloadCsvUrl(
      startDate ? new Date(startDate).toISOString() : undefined,
      endDate ? new Date(endDate).toISOString() : undefined
    );
    window.open(url, '_blank');
  };

  const filteredReadings = readings.filter((r) => {
    if (filterType === 'HW' && r.is_simulated) return false;
    if (filterType === 'SIM' && !r.is_simulated) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        r.sequence_id.toString().includes(term) ||
        r.sensor_id.toLowerCase().includes(term) ||
        r.status.toLowerCase().includes(term)
      );
    }
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
            <span className="brutalist-badge border-cyber-cyan text-cyber-cyan bg-black">
              AUDIT ARCHIVE
            </span>
            <span className="brutalist-badge border-neon-rose text-neon-rose bg-black">
              SQLITE REPOSITORY
            </span>
          </div>

          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight mt-2 flex items-center gap-2 font-mono">
            <History className="w-6 h-6 text-neon-rose animate-pulse drop-shadow-[0_0_8px_#FF007F]" />
            HISTORICAL WATER TELEMETRY LOGS
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-mono">
            Auditable sensor telemetry records stored persistently in local database
          </p>
        </div>

        <div className="relative z-10">
          <button
            onClick={handleDownloadCsv}
            className="clay-pill-rose px-4 py-2.5 text-xs font-black font-mono tracking-wider text-white shadow-[0_0_20px_rgba(255,0,127,0.4)] flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT STREAM CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (Bento) */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono border border-white/10 shadow-xl">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter sequence, sensor ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-2xl bg-black/80 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan font-mono text-xs shadow-inner"
            />
          </div>

          {/* Date Pickers */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-2xl bg-black/80 border border-white/15 text-white text-xs focus:outline-none focus:border-cyber-cyan shadow-inner font-mono"
            />
            <span className="text-slate-400 font-bold">TO</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-2xl bg-black/80 border border-white/15 text-white text-xs focus:outline-none focus:border-cyber-cyan shadow-inner font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Source Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-black/80 rounded-2xl border border-white/10">
            {(['ALL', 'HW', 'SIM'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-xl font-black font-mono tracking-wider transition-all ${
                  filterType === t
                    ? 'clay-pill-rose text-white shadow-[0_0_15px_rgba(255,0,127,0.5)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={fetchHistory}
            disabled={loading}
            className="p-2.5 rounded-2xl neomorph-btn text-slate-300 hover:text-cyber-cyan border-white/10 transition-transform hover:scale-105"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="liquid-glass liquid-sheen rounded-3xl overflow-hidden border border-white/10 bento-card shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[10px] uppercase tracking-wider text-slate-400 bg-black/80 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">RECORD ID</th>
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">FLOW RATE</th>
                <th className="py-3 px-4">INTERVAL PULSES</th>
                <th className="py-3 px-4">ACCUMULATIVE VOL</th>
                <th className="py-3 px-4">SEQUENCE ID</th>
                <th className="py-3 px-4">SENSOR MODEL</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">SOURCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredReadings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-mono">
                    No historical telemetry records match the current filters.
                  </td>
                </tr>
              ) : (
                filteredReadings.map((r) => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono">#{r.id}</td>
                    <td className="py-3 px-4 text-slate-300">{formatDateTime(r.timestamp)}</td>
                    <td className="py-3 px-4 font-black text-white">{formatFlow(r.flow_rate_lpm)}</td>
                    <td className="py-3 px-4 font-bold text-cyber-cyan">{r.pulses}</td>
                    <td className="py-3 px-4 font-bold text-slate-200">{r.total_liters.toFixed(3)} L</td>
                    <td className="py-3 px-4 text-slate-400">#{r.sequence_id}</td>
                    <td className="py-3 px-4 text-slate-400">{r.sensor_id}</td>
                    <td className="py-3 px-4">
                      <span className="brutalist-badge text-[9px] py-0 px-1 border-white/20 text-slate-300">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
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

        {/* Pagination controls */}
        <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            PAGE: <strong className="text-white font-bold">{page + 1}</strong> &bull; {pageSize} RECORDS PER SLICE
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="clay-pill px-3 py-1.5 bg-black/60 text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:text-white border-white/10 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> PREV
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={readings.length < pageSize}
              className="clay-pill px-3 py-1.5 bg-black/60 text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:text-white border-white/10 flex items-center gap-1"
            >
              NEXT <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
