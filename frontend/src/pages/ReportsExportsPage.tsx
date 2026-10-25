import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  FileText,
  BarChart2,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsSummary } from '../types';
import { formatINR, formatVolume, formatDateTime } from '../utils/formatters';

export const ReportsExportsPage: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    api.getAnalyticsSummary().then(setAnalytics).catch(() => {});
  }, []);

  const handleDownloadCsv = () => {
    const url = api.getDownloadCsvUrl(
      startDate ? new Date(startDate).toISOString() : undefined,
      endDate ? new Date(endDate).toISOString() : undefined
    );
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
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
              TELEMETRY AUDIT
            </span>
            <span className="brutalist-badge border-neon-rose text-neon-rose bg-black">
              CSV GENERATOR
            </span>
          </div>

          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight mt-2 flex items-center gap-2 font-mono">
            <FileSpreadsheet className="w-6 h-6 text-cyber-cyan animate-pulse drop-shadow-[0_0_8px_#00D2FF]" />
            TELEMETRY AUDIT REPORTS &amp; CSV EXPORTS
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-mono">
            Raw sensor logs &bull; Standardized CSV format &bull; Print-ready audit summary
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={handleDownloadCsv}
            className="clay-pill-rose px-4 py-2.5 text-xs font-black font-mono tracking-wider text-white shadow-[0_0_20px_rgba(255,0,127,0.4)] flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="clay-pill-blue px-4 py-2.5 text-xs font-black font-mono tracking-wider text-white shadow-[0_0_20px_rgba(0,210,255,0.4)] flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT PDF</span>
          </button>
        </div>
      </div>

      {/* Export Filter Settings Card (Bento) */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-6 border border-white/10 bento-card shadow-2xl">
        <div className="absolute top-3 right-3 skeuo-screw" />

        <h2 className="text-xs font-black uppercase tracking-wider text-white font-mono mb-4">
          EXPORT SCOPE &amp; CHRONOLOGICAL RANGE
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              START DATE
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-black/80 border border-white/15 text-xs text-white focus:outline-none focus:border-cyber-cyan shadow-inner font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              END DATE
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-black/80 border border-white/15 text-xs text-white focus:outline-none focus:border-cyber-cyan shadow-inner font-mono"
            />
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={handleDownloadCsv}
              className="w-full py-2.5 px-4 clay-pill-rose text-white font-black font-mono text-xs shadow-[0_0_20px_rgba(255,0,127,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>GENERATE FILTERED CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printable Water Audit Statement */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-8 border border-white/10 shadow-2xl print:bg-white print:text-black">
        <div className="border-b border-white/10 print:border-slate-300 pb-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
          <div>
            <div className="text-lg font-black tracking-tight text-white print:text-black">
              SMART WATER &amp; ENERGY MANAGER
            </div>
            <div className="text-xs text-slate-400 print:text-slate-600 mt-1">
              Official IoT Water Consumption Audit Statement &bull; College Capstone Engineering Project
            </div>
          </div>
          <div className="text-right text-xs text-slate-400 print:text-slate-600">
            <div>DATE: {new Date().toLocaleDateString('en-IN')}</div>
            <div className="text-cyber-cyan print:text-black font-bold">FORMAT: ISO/IEC TELEMETRY</div>
          </div>
        </div>

        {/* Audit Metrics Table */}
        <div className="space-y-6 font-mono">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs">
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 shadow-inner">
              <span className="text-slate-400 block text-[9px] uppercase font-bold mb-1">
                TODAY'S TOTAL
              </span>
              <strong className="text-xl font-black text-white">
                {analytics?.today_total_l.toFixed(1)} L
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 shadow-inner">
              <span className="text-slate-400 block text-[9px] uppercase font-bold mb-1">
                7-DAY CUMULATIVE
              </span>
              <strong className="text-xl font-black text-cyber-cyan">
                {analytics ? formatVolume(analytics.last_7_days_total_l) : '0 L'}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 shadow-inner">
              <span className="text-slate-400 block text-[9px] uppercase font-bold mb-1">
                DAILY MEAN
              </span>
              <strong className="text-xl font-black text-white">
                {analytics?.daily_average_l.toFixed(1)} L
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 shadow-inner">
              <span className="text-slate-400 block text-[9px] uppercase font-bold mb-1">
                PROJECTED BILL
              </span>
              <strong className="text-xl font-black text-neon-rose">
                {formatINR(analytics?.estimated_bill_inr || 0)}
              </strong>
            </div>
          </div>

          {/* Daily Table Breakdown */}
          <div className="border border-white/10 rounded-2xl overflow-hidden shadow-inner bg-black/60">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black/80 text-slate-400 border-b border-white/10 text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-4">DATE</th>
                  <th className="py-2.5 px-4">DAILY VOLUME</th>
                  <th className="py-2.5 px-4">PEAK FLOW VELOCITY</th>
                  <th className="py-2.5 px-4 text-right">ESTIMATED TARIFF COST</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {analytics?.daily_trends.map((d) => (
                  <tr key={d.date} className="hover:bg-white/5">
                    <td className="py-2.5 px-4 font-bold text-white">{d.date}</td>
                    <td className="py-2.5 px-4">{d.liters.toFixed(1)} Liters</td>
                    <td className="py-2.5 px-4 text-cyber-cyan font-bold">
                      {d.peak_lpm.toFixed(2)} L/min
                    </td>
                    <td className="py-2.5 px-4 text-right font-black text-neon-rose">
                      {formatINR(d.cost_inr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
