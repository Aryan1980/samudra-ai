import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Waves, Wind, Zap, Radio, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AlertCenter: React.FC = () => {
  const { alerts } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'EXTREME' | 'HIGH' | 'MODERATE' | 'INFORMATIONAL'>('ALL');

  const filteredAlerts = alerts.filter((a) => (filter === 'ALL' ? true : a.severity === filter));

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'WAVE': return Waves;
      case 'WIND': return Wind;
      case 'LIGHTNING': return Zap;
      case 'CYCLONE': return Radio;
      case 'IMBL': return ShieldAlert;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="bg-[#050b18]/85 border border-cyan-500/25 rounded-2xl p-4 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col h-full text-xs">
      
      {/* Header & Filter Pills */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-900/40 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-white tracking-wide">Active Marine Alerts</h3>
            <span className="text-[10px] text-slate-400">Statutory Navigational Advisories</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[9px] font-mono">
          {(['ALL', 'EXTREME', 'HIGH'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all font-bold ${
                filter === sev
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'bg-[#09142e] text-slate-400 hover:text-white border border-cyan-900/40'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alert List */}
      <div className="mt-3 space-y-2.5 overflow-y-auto flex-1 pr-1 max-h-72">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span className="font-medium text-slate-300">No active hazard warnings matching filter.</span>
            <p className="text-[11px] text-slate-500">All meteorological parameters are within safe limits.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const Icon = getAlertIcon(alert.category);
            const isExtreme = alert.severity === 'EXTREME';
            const isHigh = alert.severity === 'HIGH';

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border transition-all duration-200 shadow-md ${
                  isExtreme
                    ? 'bg-rose-950/40 border-rose-600/60 text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.25)]'
                    : isHigh
                    ? 'bg-amber-950/40 border-amber-600/60 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                    : 'bg-[#09142e]/90 border-cyan-900/40 text-slate-200'
                }`}
              >
                <div className="flex items-start gap-3 mb-1.5">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    isExtreme ? 'bg-rose-500/20 text-rose-300' : isHigh ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-white">{alert.title}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-extrabold ${
                        isExtreme ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : isHigh ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      {alert.message}
                    </p>

                    <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Source: {alert.source}</span>
                      <span className="text-cyan-400">Buffer: {alert.affected_radius_km} km</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
