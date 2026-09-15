import React from 'react';
import { Sparkles, Terminal } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const DEMO_QUERIES = [
  { id: '1', text: 'Where is the nearest PFZ?', tag: 'PFZ', color: 'from-cyan-500 to-blue-600' },
  { id: '2', text: 'Is it safe to go fishing tomorrow morning?', tag: 'Safety', color: 'from-emerald-500 to-teal-600' },
  { id: '3', text: 'What are the wave and wind conditions?', tag: 'Weather', color: 'from-blue-500 to-indigo-600' },
  { id: '4', text: 'Show areas with high chlorophyll and favourable SST.', tag: 'Ocean', color: 'from-teal-500 to-emerald-600' },
  { id: '5', text: 'Which PFZ is safest?', tag: 'Ranking', color: 'from-purple-500 to-indigo-600' },
  { id: '6', text: 'Find a safe route to the nearest PFZ.', tag: 'Route', color: 'from-amber-500 to-orange-600' },
  { id: '7', text: 'Are there any cyclone or lightning alerts?', tag: 'Alerts', color: 'from-rose-500 to-red-600' },
  { id: '8', text: 'Am I approaching a restricted area?', tag: 'Geofence', color: 'from-indigo-500 to-purple-600' },
];

export const DemoQueries: React.FC = () => {
  const { sendQuery, isAnalyzing } = useApp();

  return (
    <div className="border-b border-cyan-900/30 bg-[#030712]/70 p-2.5 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
          <Sparkles className="w-3 h-3 text-cyan-400 animate-spin-slow" />
          <span>ISRO Operational Demo Queries</span>
        </div>
        <span className="text-[9px] font-mono text-slate-500 hidden sm:inline">1-Click Instant Execution</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {DEMO_QUERIES.map((q) => (
          <button
            key={q.id}
            disabled={isAnalyzing}
            onClick={() => sendQuery(q.text)}
            className="flex-shrink-0 text-left text-[11px] px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-[#07132b] border border-cyan-900/40 hover:border-cyan-500/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] text-slate-300 hover:text-white transition-all duration-200 flex items-center gap-2 disabled:opacity-40 cursor-pointer group"
          >
            <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-md text-white bg-gradient-to-r ${q.color} shadow-sm`}>
              {q.tag}
            </span>
            <span className="truncate max-w-[170px] font-medium group-hover:text-cyan-200 transition-colors">{q.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
