import React, { useState, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  History,
  Beaker,
  Save,
  Calculator,
} from 'lucide-react';
import { api } from '../services/api';
import { CalibrationInfo, CalibrationCalculation, CalibrationRecord } from '../types';
import { formatDateTime } from '../utils/formatters';

export const CalibrationPage: React.FC = () => {
  const [currentInfo, setCurrentInfo] = useState<CalibrationInfo | null>(null);
  const [history, setHistory] = useState<CalibrationRecord[]>([]);

  // Wizard form state
  const [testVolume, setTestVolume] = useState<number>(5.0);
  const [testPulses, setTestPulses] = useState<number>(2250);
  const [notes, setNotes] = useState('');
  const [calculation, setCalculation] = useState<CalibrationCalculation | null>(null);

  const [calculating, setCalculating] = useState(false);
  const [applying, setApplying] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; success: boolean } | null>(null);

  const loadCalibrationData = async () => {
    try {
      const [cur, hist] = await Promise.all([
        api.getCurrentCalibration(),
        api.getCalibrationHistory(),
      ]);
      setCurrentInfo(cur);
      setHistory(hist);
    } catch (err: any) {
      console.warn('Calibration data load failed:', err);
    }
  };

  useEffect(() => {
    loadCalibrationData();
  }, []);

  const handleCalculate = async () => {
    try {
      setCalculating(true);
      setStatusMsg(null);
      const res = await api.calculateCalibration(testVolume, testPulses);
      setCalculation(res);
    } catch (err: any) {
      setStatusMsg({ text: err.message, success: false });
    } finally {
      setCalculating(false);
    }
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      setStatusMsg(null);
      await api.applyCalibration({
        test_volume_liters: testVolume,
        pulses_recorded: testPulses,
        apply_immediately: true,
        notes: notes || undefined,
      });
      setStatusMsg({
        text: `Calibration factor updated successfully to ${calculation?.calculated_k_factor || (testPulses / testVolume).toFixed(2)} pulses/L!`,
        success: true,
      });
      await loadCalibrationData();
    } catch (err: any) {
      setStatusMsg({ text: err.message, success: false });
    } finally {
      setApplying(false);
    }
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
              PRECISION LAB
            </span>
            <span className="brutalist-badge border-neon-rose text-neon-rose bg-black">
              K-FACTOR DERIVATION
            </span>
          </div>

          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight mt-2 flex items-center gap-2 font-mono">
            <Sliders className="w-6 h-6 text-cyber-cyan animate-pulse drop-shadow-[0_0_8px_#00D2FF]" />
            WATER FLOW SENSOR CALIBRATION LABORATORY
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-mono">
            Empirical pulse factor derivation &bull; Known-volume bucket verification &bull; Audit history
          </p>
        </div>

        <div className="relative z-10">
          <span className="brutalist-badge border-cyber-cyan text-cyber-cyan bg-black px-3 py-1">
            ACTIVE FACTOR: {currentInfo?.calibration_factor || 450} PULSES/L
          </span>
        </div>
      </div>

      {/* Status banner */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 border ${
            statusMsg.success
              ? 'liquid-glass-blue border-cyber-cyan/50 text-cyber-cyan shadow-[0_0_20px_rgba(0,210,255,0.3)]'
              : 'liquid-glass-rose border-neon-rose/50 text-neon-rose shadow-[0_0_20px_rgba(255,0,127,0.3)]'
          }`}
        >
          {statusMsg.success ? (
            <CheckCircle2 className="w-4 h-4 text-cyber-cyan shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-neon-rose shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Top Overview Cards (Bento 3-Card Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
        <div className="liquid-glass liquid-sheen rounded-3xl p-6 border-l-4 border-l-cyber-cyan border-white/10 bento-card shadow-xl">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
            CURRENT ACTIVE FACTOR (K)
          </span>
          <div className="text-3xl font-black text-white">
            {currentInfo?.calibration_factor || 450.0}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Pulses required to calculate 1.00 Liter of water
          </p>
        </div>

        <div className="liquid-glass liquid-sheen rounded-3xl p-6 border-l-4 border-l-neon-rose border-white/10 bento-card shadow-xl">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
            NOMINAL FACTORY BASELINE
          </span>
          <div className="text-3xl font-black text-neon-rose">
            450.00
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Formula: F = 7.5 &times; Q (7.5 Hz per L/min &times; 60s)
          </p>
        </div>

        <div className="liquid-glass liquid-sheen rounded-3xl p-6 border-l-4 border-l-cyber-blue border-white/10 bento-card shadow-xl">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
            CALIBRATION STATUS
          </span>
          <div className="text-xl font-black text-cyber-cyan flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-cyber-cyan" />
            EMPIRICALLY VERIFIED
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {history.length} calibration events recorded in database
          </p>
        </div>
      </div>

      {/* Known Volume Bucket Test Wizard */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-6 border border-white/10 bento-card shadow-2xl">
        <div className="absolute top-3 right-3 skeuo-screw" />

        <div className="flex items-center gap-2 mb-4">
          <Beaker className="w-5 h-5 text-cyber-cyan" />
          <h2 className="text-xs font-black uppercase tracking-wider text-white font-mono">
            KNOWN-VOLUME CONTAINER CALIBRATION WIZARD
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2 shadow-inner">
            <span className="font-black text-cyber-cyan uppercase text-[10px] block">
              STEP 1: MEASUREMENT PROTOCOL
            </span>
            <p className="text-slate-300 leading-relaxed">
              Fill a precisely measured container (e.g. standard 5-Liter graduated bucket) through the water flow sensor at typical operating velocity.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2 shadow-inner">
            <span className="font-black text-neon-rose uppercase text-[10px] block">
              STEP 2: PULSE COUNTING
            </span>
            <p className="text-slate-300 leading-relaxed">
              Observe total pulses counted on the Water Monitoring page during the filling interval, then enter the exact pulse tally below.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2 shadow-inner">
            <span className="font-black text-white uppercase text-[10px] block">
              STEP 3: VERIFICATION &amp; SAVE
            </span>
            <p className="text-slate-300 leading-relaxed">
              Click Calculate to inspect variance from nominal (450 p/L). If satisfactory, apply the new calibration factor to save it to database and firmware.
            </p>
          </div>
        </div>

        {/* Wizard Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 rounded-2xl bg-black/70 border border-white/10 font-mono shadow-inner">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              MEASURED CONTAINER VOLUME (LITERS)
            </label>
            <input
              type="number"
              min="0.5"
              max="100.0"
              step="0.1"
              value={testVolume}
              onChange={(e) => setTestVolume(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-black/90 border border-white/15 text-sm text-white font-bold focus:outline-none focus:border-cyber-cyan"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              TOTAL PULSES COUNTED
            </label>
            <input
              type="number"
              min="10"
              max="50000"
              step="1"
              value={testPulses}
              onChange={(e) => setTestPulses(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-black/90 border border-white/15 text-sm text-white font-bold focus:outline-none focus:border-cyber-cyan"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              CALIBRATION TEST NOTES
            </label>
            <input
              type="text"
              placeholder="e.g. 5L bucket test at 4.2 L/min flow"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-black/90 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <button
            onClick={handleCalculate}
            disabled={calculating || testVolume <= 0 || testPulses <= 0}
            className="clay-pill px-5 py-2.5 bg-black/80 text-cyber-cyan border-cyber-cyan/40 text-xs font-black font-mono tracking-wider flex items-center gap-2 hover:scale-105"
          >
            <Calculator className="w-4 h-4" />
            <span>CALCULATE CALIBRATION FACTOR</span>
          </button>

          {calculation && (
            <button
              onClick={handleApply}
              disabled={applying}
              className="clay-pill-rose px-5 py-2.5 text-xs font-black font-mono tracking-wider text-white shadow-[0_0_20px_rgba(255,0,127,0.5)] flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>APPLY &amp; SAVE NEW FACTOR ({calculation.calculated_k_factor} P/L)</span>
            </button>
          )}
        </div>

        {/* Calculation Result Box */}
        {calculation && (
          <div className="mt-6 p-4 rounded-2xl liquid-glass-blue border border-cyber-cyan/40 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono shadow-xl">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">CALCULATED K-FACTOR</span>
              <span className="text-lg font-black text-white">{calculation.calculated_k_factor} P/L</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">NOMINAL BASELINE</span>
              <span className="text-lg font-bold text-slate-300">{calculation.nominal_k_factor} P/L</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">VARIANCE FROM NOMINAL</span>
              <span
                className={`text-lg font-black ${
                  Math.abs(calculation.variance_percent_from_nominal) < 10
                    ? 'text-cyber-cyan'
                    : 'text-neon-rose'
                }`}
              >
                {calculation.variance_percent_from_nominal > 0
                  ? `+${calculation.variance_percent_from_nominal}%`
                  : `${calculation.variance_percent_from_nominal}%`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">VALIDATION STATE</span>
              <span className="brutalist-badge text-[9px] py-0 px-1.5 border-cyber-cyan text-cyber-cyan inline-block mt-1">
                {calculation.status}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Historical Calibration Records */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-6 border border-white/10 bento-card shadow-2xl">
        <div className="absolute top-3 right-3 skeuo-screw" />

        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-neon-rose" />
          <h2 className="text-xs font-black uppercase tracking-wider text-white font-mono">
            SENSOR CALIBRATION HISTORY AUDIT
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[10px] uppercase tracking-wider text-slate-400 bg-black/80 border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3">DATE</th>
                <th className="py-2.5 px-3">TEST VOLUME</th>
                <th className="py-2.5 px-3">PULSES RECORDED</th>
                <th className="py-2.5 px-3">CALCULATED FACTOR</th>
                <th className="py-2.5 px-3">PREVIOUS FACTOR</th>
                <th className="py-2.5 px-3">NOTES</th>
                <th className="py-2.5 px-3 text-right">APPLIED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-mono">
                    No calibration history recorded yet. Use the wizard above to execute your first test.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} className="hover:bg-white/5">
                    <td className="py-2.5 px-3 text-slate-400">{formatDateTime(h.timestamp)}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{h.test_volume_liters.toFixed(2)} L</td>
                    <td className="py-2.5 px-3 text-cyber-cyan font-bold">{h.pulses_recorded}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-neon-rose">
                      {h.calculated_k_factor.toFixed(2)} p/L
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{h.previous_k_factor.toFixed(2)} p/L</td>
                    <td className="py-2.5 px-3 text-slate-300">{h.notes || '—'}</td>
                    <td className="py-2.5 px-3 text-right">
                      {h.applied ? (
                        <span className="text-cyber-cyan font-bold">YES</span>
                      ) : (
                        <span className="text-slate-500">NO</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
