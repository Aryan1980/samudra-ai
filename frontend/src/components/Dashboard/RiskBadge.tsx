import React from 'react';
import { Shield, AlertTriangle, CheckCircle2, Info, Activity, Flame } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RiskBadge: React.FC = () => {
  const { risk } = useApp();

  if (!risk) {
    return (
      <div className="glass-panel rounded-2xl p-4 text-xs text-slate-400 animate-pulse flex items-center justify-center h-full min-h-[140px]">
        <Activity className="w-4 h-4 text-cyan-400 animate-spin mr-2" />
        <span>Evaluating deterministic multi-factor safety matrix...</span>
      </div>
    );
  }

  const score = risk.overall_score;

  // Determine aesthetic colors
  const getTheme = (level: string) => {
    switch (level) {
      case 'LOW':
        return {
          glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
          border: 'border-emerald-500/40',
          gradient: 'from-emerald-500/10 via-emerald-950/20 to-[#030712]',
          badgeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
          strokeColor: '#10b981',
          textClass: 'text-emerald-400',
          status: 'SAFE TO SAIL',
          icon: CheckCircle2
        };
      case 'MODERATE':
        return {
          glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
          border: 'border-amber-500/40',
          gradient: 'from-amber-500/10 via-amber-950/20 to-[#030712]',
          badgeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]',
          strokeColor: '#f59e0b',
          textClass: 'text-amber-400',
          status: 'PROCEED WITH CAUTION',
          icon: AlertTriangle
        };
      case 'HIGH':
        return {
          glow: 'shadow-[0_0_30px_rgba(244,63,94,0.25)]',
          border: 'border-rose-500/40',
          gradient: 'from-rose-500/10 via-rose-950/20 to-[#030712]',
          badgeBg: 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]',
          strokeColor: '#f43f5e',
          textClass: 'text-rose-400',
          status: 'HIGH RISK: AVOID OFFSHORE',
          icon: AlertTriangle
        };
      default:
        return {
          glow: 'shadow-[0_0_40px_rgba(225,29,72,0.4)]',
          border: 'border-rose-600',
          gradient: 'from-rose-600/20 via-rose-950/40 to-[#030712]',
          badgeBg: 'bg-rose-950 text-rose-200 border-rose-600 animate-pulse shadow-[0_0_20px_rgba(225,29,72,0.6)]',
          strokeColor: '#e11d48',
          textClass: 'text-rose-400',
          status: 'EXTREME HAZARD: HARBOR ONLY',
          icon: Flame
        };
    }
  };

  const theme = getTheme(risk.risk_level);
  const Icon = theme.icon;

  // Arc calculation for radial gauge
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * (circumference * 0.75);

  return (
    <div className={`relative rounded-2xl p-4 border ${theme.border} bg-gradient-to-br ${theme.gradient} backdrop-blur-xl ${theme.glow} transition-all duration-300 flex flex-col justify-between h-full`}>
      
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-cyan-400" />
            Deterministic Marine Safety Matrix
          </span>
          <div className="mt-1.5 flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold tracking-wide border flex items-center gap-1.5 ${theme.badgeBg}`}>
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              {theme.status}
            </span>
          </div>
        </div>

        {/* Circular SVG Gauge */}
        <div className="relative w-18 h-18 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full -rotate-135 transform" viewBox="0 0 90 90">
            {/* Background Track */}
            <circle
              cx="45"
              cy="45"
              r={radius}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="7"
              fill="none"
              strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            />
            {/* Value Arc */}
            <circle
              cx="45"
              cy="45"
              r={radius}
              stroke={theme.strokeColor}
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
              style={{
                strokeDashoffset: strokeDashoffset,
                transition: 'stroke-dashoffset 1s ease-in-out'
              }}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center inset-0">
            <span className="font-mono text-base font-extrabold text-white leading-none">
              {score}
            </span>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter mt-0.5">
              /100
            </span>
          </div>
        </div>
      </div>

      {/* Safety Advisory Quotation */}
      <p className="text-[11px] text-slate-200 leading-relaxed font-medium mb-3 border-l-2 border-cyan-500/50 pl-2.5 py-0.5">
        {risk.recommendation}
      </p>

      {/* Factor Bars with Neon Gradients */}
      <div className="space-y-1.5 pt-2.5 border-t border-slate-800/80 text-[10px]">
        {risk.factors.slice(0, 4).map((f) => (
          <div key={f.factor_name} className="flex items-center justify-between gap-2">
            <span className="text-slate-400 w-24 truncate font-medium">{f.factor_name}</span>
            <div className="flex-1 bg-slate-950/80 rounded-full h-1.5 overflow-hidden border border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  f.severity === 'LOW' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                  f.severity === 'MODERATE' ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                  'bg-gradient-to-r from-rose-600 to-red-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, f.score))}%` }}
              />
            </div>
            <span className="text-slate-300 font-mono w-10 text-right font-semibold">
              {f.score.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-500">
        <span className="truncate max-w-[260px]">Zero hallucination operational decision support</span>
        <span className="font-mono text-cyan-500 font-bold">ISRO/INCOIS</span>
      </div>

    </div>
  );
};
