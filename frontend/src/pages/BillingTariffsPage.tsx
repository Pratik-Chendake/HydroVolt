import React, { useState, useEffect } from 'react';
import {
  Receipt,
  IndianRupee,
  Calculator,
  Save,
  CheckCircle2,
  TrendingDown,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { TariffConfig } from '../types';
import { formatINR } from '../utils/formatters';

export const BillingTariffsPage: React.FC = () => {
  const [tariffs, setTariffs] = useState<TariffConfig | null>(null);
  const [tier1Limit, setTier1Limit] = useState(10000);
  const [tier1Rate, setTier1Rate] = useState(15);
  const [tier2Limit, setTier2Limit] = useState(25000);
  const [tier2Rate, setTier2Rate] = useState(25);
  const [tier3Rate, setTier3Rate] = useState(40);
  const [fixedCharge, setFixedCharge] = useState(50);
  const [seweragePct, setSeweragePct] = useState(10);
  const [monthlyTarget, setMonthlyTarget] = useState(15000);
  const [dailyTarget, setDailyTarget] = useState(500);

  // Bill simulator calculator state
  const [simVolume, setSimVolume] = useState(15000);
  const [estimate, setEstimate] = useState<any>(null);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadTariffs = async () => {
    try {
      const data = await api.getTariffs();
      setTariffs(data);
      setTier1Limit(data.tier1_limit_liters);
      setTier1Rate(data.tier1_rate_per_kl);
      setTier2Limit(data.tier2_limit_liters);
      setTier2Rate(data.tier2_rate_per_kl);
      setTier3Rate(data.tier3_rate_per_kl);
      setFixedCharge(data.fixed_meter_charge);
      setSeweragePct(data.sewerage_charge_percent);
      setMonthlyTarget(data.monthly_target_liters);
      setDailyTarget(data.daily_target_liters);
    } catch (err) {
      console.warn('Tariff fetch error:', err);
    }
  };

  useEffect(() => {
    loadTariffs();
  }, []);

  useEffect(() => {
    api.estimateCost(simVolume)
      .then(setEstimate)
      .catch(() => {});
  }, [simVolume, tier1Rate, tier2Rate, tier3Rate, seweragePct, fixedCharge]);

  const handleSaveTariffs = async () => {
    try {
      setSaving(true);
      const updated = await api.updateTariffs({
        tier1_limit_liters: tier1Limit,
        tier1_rate_per_kl: tier1Rate,
        tier2_limit_liters: tier2Limit,
        tier2_rate_per_kl: tier2Rate,
        tier3_rate_per_kl: tier3Rate,
        fixed_meter_charge: fixedCharge,
        sewerage_charge_percent: seweragePct,
        monthly_target_liters: monthlyTarget,
        daily_target_liters: dailyTarget,
      });
      setTariffs(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Error saving tariffs: ${err.message}`);
    } finally {
      setSaving(false);
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
              MUNICIPAL TARIFFS
            </span>
            <span className="brutalist-badge border-neon-rose text-neon-rose bg-black">
              INR (₹) SCHEDULE
            </span>
          </div>

          <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight mt-2 flex items-center gap-2 font-mono">
            <Receipt className="w-6 h-6 text-neon-rose animate-pulse drop-shadow-[0_0_8px_#FF007F]" />
            BILLING STRUCTURE &amp; VOLUMETRIC WATER TARIFFS
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-mono">
            Indian Rupee (₹) volumetric tiered billing &bull; Municipal sewerage surcharges &bull; Budget quotas
          </p>
        </div>

        {savedSuccess && (
          <span className="clay-pill-rose px-3.5 py-1.5 text-xs font-mono font-bold text-white flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,0,127,0.5)]">
            <CheckCircle2 className="w-4 h-4" /> TARIFFS PERSISTED
          </span>
        )}
      </div>

      {/* Main Grid: Tariff Settings + Bill Estimator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tariff Tiers Form (Span 2) */}
        <div className="lg:col-span-2 liquid-glass liquid-sheen rounded-3xl p-6 border border-white/10 bento-card shadow-2xl">
          <div className="absolute top-3 left-3 skeuo-screw" />

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-white font-mono">
                TIERED WATER TARIFF SCHEDULE
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                1 kL = 1,000 Liters. Rates are billed per thousand liters consumed.
              </p>
            </div>
            <span className="brutalist-badge border-cyber-cyan text-cyber-cyan bg-black">
              CURRENCY: INR (₹)
            </span>
          </div>

          <div className="space-y-4 font-mono">
            {/* Tier 1 */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-inner">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-cyber-cyan block mb-1">
                  TIER 1 LIMIT (LITERS)
                </label>
                <input
                  type="number"
                  step="500"
                  value={tier1Limit}
                  onChange={(e) => setTier1Limit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-black/90 border border-white/15 text-white focus:outline-none focus:border-cyber-cyan text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Subsidized lifeline volume</span>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-cyber-cyan block mb-1">
                  TIER 1 RATE (₹ / KL)
                </label>
                <input
                  type="number"
                  step="1"
                  value={tier1Rate}
                  onChange={(e) => setTier1Rate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-black/90 border border-white/15 text-white focus:outline-none focus:border-cyber-cyan text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">₹{tier1Rate.toFixed(2)} per 1,000 L</span>
              </div>
            </div>

            {/* Tier 2 */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-inner">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neon-rose block mb-1">
                  TIER 2 LIMIT (LITERS)
                </label>
                <input
                  type="number"
                  step="500"
                  value={tier2Limit}
                  onChange={(e) => setTier2Limit(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-black/90 border border-white/15 text-white focus:outline-none focus:border-cyber-cyan text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Standard residential bracket</span>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neon-rose block mb-1">
                  TIER 2 RATE (₹ / KL)
                </label>
                <input
                  type="number"
                  step="1"
                  value={tier2Rate}
                  onChange={(e) => setTier2Rate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-black/90 border border-white/15 text-white focus:outline-none focus:border-cyber-cyan text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">₹{tier2Rate.toFixed(2)} per 1,000 L</span>
              </div>
            </div>

            {/* Tier 3 & Surcharges */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-inner">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
                  TIER 3 RATE (₹ / KL)
                </label>
                <input
                  type="number"
                  step="1"
                  value={tier3Rate}
                  onChange={(e) => setTier3Rate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-black/90 border border-white/15 text-white focus:outline-none focus:border-cyber-cyan text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Above {tier2Limit} L</span>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  SEWERAGE CHARGE (%)
                </label>
                <input
                  type="number"
                  step="1"
                  value={seweragePct}
                  onChange={(e) => setSeweragePct(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-black/90 border border-white/15 text-white focus:outline-none focus:border-cyber-cyan text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">% of volumetric charge</span>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  FIXED METER RENT (₹)
                </label>
                <input
                  type="number"
                  step="5"
                  value={fixedCharge}
                  onChange={(e) => setFixedCharge(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-black/90 border border-white/15 text-white focus:outline-none focus:border-cyber-cyan text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Monthly fixed rent</span>
              </div>
            </div>

            {/* Target Budgets */}
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-inner">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white block mb-1">
                  DAILY TARGET BUDGET (LITERS)
                </label>
                <input
                  type="number"
                  step="50"
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-black/90 border border-white/15 text-white focus:outline-none focus:border-cyber-cyan text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-white block mb-1">
                  MONTHLY TARGET BUDGET (LITERS)
                </label>
                <input
                  type="number"
                  step="500"
                  value={monthlyTarget}
                  onChange={(e) => setMonthlyTarget(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-black/90 border border-white/15 text-white focus:outline-none focus:border-cyber-cyan text-xs"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveTariffs}
              disabled={saving}
              className="clay-pill-rose px-6 py-2.5 text-xs font-black font-mono tracking-wider text-white shadow-[0_0_20px_rgba(255,0,127,0.5)] flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'SAVING...' : 'SAVE TARIFF SETTINGS'}</span>
            </button>
          </div>
        </div>

        {/* Live Bill Estimator Calculator (Span 1) */}
        <div className="liquid-glass-blue liquid-sheen rounded-3xl p-6 flex flex-col justify-between border border-cyber-cyan/40 bento-card shadow-2xl">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-cyber-cyan" />
              <h2 className="text-xs font-black uppercase tracking-wider text-white font-mono">
                INTERACTIVE BILL ESTIMATOR
              </h2>
            </div>

            <p className="text-xs text-slate-300 mb-6 font-mono leading-relaxed">
              Test how different consumption quantities translate into monthly billing under current active tariffs.
            </p>

            <div className="mb-6 space-y-3 font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">SIMULATED VOLUME:</span>
                <span className="font-black text-white">{simVolume.toLocaleString()} L</span>
              </div>
              <input
                type="range"
                min="1000"
                max="50000"
                step="500"
                value={simVolume}
                onChange={(e) => setSimVolume(parseInt(e.target.value))}
                className="w-full accent-cyber-cyan cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1,000 L</span>
                <span>25,000 L</span>
                <span>50,000 L</span>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 text-xs font-mono p-4 rounded-2xl bg-black/80 border border-white/10 shadow-inner">
              <div className="flex justify-between">
                <span className="text-slate-400">VOLUMETRIC:</span>
                <span className="text-white font-bold">
                  {formatINR(estimate?.volumetric_cost_inr || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">FIXED METER:</span>
                <span className="text-white font-bold">{formatINR(estimate?.fixed_charge_inr || 0)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10 font-bold text-sm">
                <span className="text-cyber-cyan">TOTAL BILL:</span>
                <span className="text-neon-rose font-black text-base">{formatINR(estimate?.total_estimated_inr || 0)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-2xl bg-black/60 border border-white/10 text-[10px] text-slate-400 font-mono flex items-start gap-2 shadow-inner">
            <Info className="w-4 h-4 text-cyber-cyan shrink-0 mt-0.5" />
            <span>
              Includes configured municipal sewerage surcharge and monthly meter maintenance fee.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
