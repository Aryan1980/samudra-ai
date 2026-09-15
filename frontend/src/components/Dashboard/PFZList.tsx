import React, { useState } from 'react';
import { Fish, Navigation, ArrowUpRight, Compass, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PFZList: React.FC = () => {
  const { pfzs, routeToPFZ, isAnalyzing } = useApp();
  const [sortBy, setSortBy] = useState<'distance' | 'suitability' | 'safety'>('distance');

  const sortedPfzs = [...pfzs].sort((a, b) => {
    if (sortBy === 'distance') return a.distance_km - b.distance_km;
    if (sortBy === 'suitability') return b.suitability_score - a.suitability_score;
    const rank: Record<string, number> = { SAFE: 1, CAUTION: 2, AVOID: 3 };
    return (rank[a.safety_rating] || 9) - (rank[b.safety_rating] || 9);
  });

  return (
    <div className="bg-[#050b18]/85 border border-cyan-500/25 rounded-2xl p-4 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col h-full">
      
      {/* Header & Sort Selector */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-cyan-900/40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <Fish className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-white tracking-wide">Potential Fishing Zones</h3>
            <span className="text-[10px] text-slate-400">Oceansat-3 Frontal Convergence</span>
          </div>
        </div>

        {/* Sort selector */}
        <select
          value={sortBy}
          onChange={(e: any) => setSortBy(e.target.value)}
          className="bg-[#09142e] border border-cyan-900/50 hover:border-cyan-500/60 rounded-xl px-2.5 py-1 text-[10px] font-mono text-cyan-300 outline-none cursor-pointer transition-all"
        >
          <option value="distance">Sort: Nearest Distance</option>
          <option value="suitability">Sort: Highest Suitability</option>
          <option value="safety">Sort: Safest Rating</option>
        </select>
      </div>

      {/* PFZ Card List */}
      <div className="mt-3 space-y-2.5 overflow-y-auto flex-1 pr-1 max-h-72">
        {sortedPfzs.map((pfz, idx) => (
          <div
            key={pfz.id}
            className="relative overflow-hidden bg-gradient-to-br from-[#09142e]/90 to-[#050b18] hover:border-cyan-500/50 border border-cyan-900/40 rounded-xl p-3 transition-all duration-200 shadow-md group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-mono text-[10px] font-bold">
                    #{idx + 1}
                  </span>
                  <span className="group-hover:text-cyan-200 transition-colors">{pfz.name}</span>
                </div>
                <div className="text-[10px] text-cyan-400 font-mono mt-1 flex items-center gap-1.5 font-semibold">
                  <Compass className="w-3 h-3 text-cyan-400" />
                  <span>{pfz.distance_km} km ({pfz.bearing_compass}, {pfz.bearing_deg}?)</span>
                </div>
              </div>

              {/* Safety Badge */}
              <span
                className={`px-2.5 py-0.5 rounded-full font-extrabold text-[9px] uppercase tracking-wider ${
                  pfz.safety_rating === 'SAFE'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : pfz.safety_rating === 'CAUTION'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                }`}
              >
                {pfz.safety_rating}
              </span>
            </div>

            {/* Scientific Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 bg-[#030712]/80 p-2 rounded-xl border border-cyan-950 text-[10px] mb-2.5">
              <div>
                <span className="text-slate-500 block text-[9px] font-mono">SST</span>
                <span className="font-mono font-bold text-cyan-300">{pfz.sst_c}?C</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] font-mono">Chlorophyll</span>
                <span className="font-mono font-bold text-emerald-300">{pfz.chlorophyll_mg_m3} mg/m?</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] font-mono">Suitability</span>
                <span className="font-mono font-bold text-amber-300">{pfz.suitability_score}%</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed mb-3 font-normal">
              {pfz.recommendation}
            </p>

            {/* Route Action Button */}
            <button
              disabled={isAnalyzing}
              onClick={() => routeToPFZ(pfz)}
              className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-cyan-600/90 to-blue-600/90 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-950 cursor-pointer disabled:opacity-40"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Plot Safe Route to PFZ</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
