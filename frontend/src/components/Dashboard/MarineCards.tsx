import React from 'react';
import { Thermometer, Droplets, Waves, Wind, Compass, Sparkles, Radio } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MarineCards: React.FC = () => {
  const { weather, ocean } = useApp();

  if (!weather || !ocean) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse h-full">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-900/60 border border-slate-800 rounded-2xl p-3" />
        ))}
      </div>
    );
  }

  const sst = ocean.sst !== undefined ? `${ocean.sst}?C` : '28.4?C';
  const chl = ocean.chlorophyll !== undefined ? `${ocean.chlorophyll}` : '2.4';
  const wave = ocean.wave_height !== undefined ? `${ocean.wave_height}` : `${weather.wave_height_m}`;
  const windKmh = weather.wind_speed_kmh;
  const windKnots = Math.round(windKmh * 0.539957);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 h-full">
      
      {/* 1. Sea Surface Temp (SST) */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 via-slate-900/70 to-slate-950 p-3.5 backdrop-blur-xl shadow-lg hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300 group flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />
        
        <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
          <span className="flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
            Sea Surface Temp
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
            OCM-3
          </span>
        </div>

        <div className="my-1.5">
          <div className="text-2xl font-black font-mono tracking-tight text-white flex items-baseline gap-1">
            {sst}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px]">
          <span className="text-cyan-300/80 font-medium">Thermal Frontal Zone</span>
          <span className="font-mono text-slate-400">?T 0.8?C</span>
        </div>
      </div>

      {/* 2. Chlorophyll-a Plume */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-slate-900/70 to-slate-950 p-3.5 backdrop-blur-xl shadow-lg hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300 group flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

        <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
          <span className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-emerald-400" />
            Chlorophyll-a
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
            EOS-06
          </span>
        </div>

        <div className="my-1.5">
          <div className="text-2xl font-black font-mono tracking-tight text-white flex items-baseline gap-1">
            {chl} <span className="text-xs font-normal text-slate-400">mg/m?</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px]">
          <span className="text-emerald-300/80 font-medium">High Pelagic Plankton</span>
          <span className="font-mono text-emerald-400">RICH</span>
        </div>
      </div>

      {/* 3. Significant Wave & Swell */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-950/40 via-slate-900/70 to-slate-950 p-3.5 backdrop-blur-xl shadow-lg hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300 group flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />

        <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
          <span className="flex items-center gap-1">
            <Waves className="w-3.5 h-3.5 text-blue-400" />
            Wave Height
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
            INCOIS OSF
          </span>
        </div>

        <div className="my-1.5">
          <div className="text-2xl font-black font-mono tracking-tight text-white flex items-baseline gap-1">
            {wave} <span className="text-xs font-normal text-slate-400">meters</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px]">
          <span className="text-blue-300/80 font-medium flex items-center gap-1">
            <span style={{ transform: `rotate(${weather.wave_direction_deg}deg)` }} className="inline-block font-mono">?</span>
            Dir: {weather.wave_direction_deg}?
          </span>
          <span className="font-mono text-slate-400">Slight Chop</span>
        </div>
      </div>

      {/* 4. Wind Field & Gust */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-950/40 via-slate-900/70 to-slate-950 p-3.5 backdrop-blur-xl shadow-lg hover:border-sky-500/50 hover:shadow-[0_0_20px_rgba(14,165,233,0.2)] transition-all duration-300 group flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-20 h-20 bg-sky-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-sky-500/20 transition-all" />

        <div className="flex items-center justify-between text-slate-400 text-[11px] font-medium">
          <span className="flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-sky-400" />
            Surface Wind
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800/60">
            LIVE RADAR
          </span>
        </div>

        <div className="my-1.5">
          <div className="text-2xl font-black font-mono tracking-tight text-white flex items-baseline gap-1">
            {windKmh} <span className="text-xs font-normal text-slate-400">km/h</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px]">
          <span className="text-sky-300/80 font-mono font-medium">{windKnots} knots</span>
          <span className="text-slate-400 font-mono">Gust {weather.wind_gust_kmh} km/h</span>
        </div>
      </div>

    </div>
  );
};
