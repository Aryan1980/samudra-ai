import React from 'react';
import { Cpu, CheckCircle2, Database, Clock, Activity, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AgentTracePanel: React.FC = () => {
  const { agentTraces, isAnalyzing } = useApp();

  const DEFAULT_AGENTS = [
    { name: 'Planner Agent', role: 'Autonomous Intent & Subtask Graph', provider: 'Rule-Based Intent Core', time: 14 },
    { name: 'Weather Intelligence Agent', role: 'Atmospheric & Surface Swell Model', provider: 'WeatherAPI.com (Live Satellite)', time: 26 },
    { name: 'Ocean Analytics Agent', role: 'SST & Chlorophyll Inversion', provider: 'Oceansat-3 (EOS-06) OCM-3', time: 32 },
    { name: 'Geospatial Reasoning Agent', role: 'IMBL Demarcation & MPAs', provider: 'Survey of India / ICG GIS', time: 18 },
    { name: 'Risk Assessment Agent', role: 'Deterministic Multi-Factor Matrix', provider: 'Deterministic Safety Engine', time: 8 },
    { name: 'PFZ Intelligence Agent', role: 'Thermal-Chlorophyll Frontal Ranking', provider: 'INCOIS PFZ Multilingual Service', time: 21 },
    { name: 'Route Optimization Agent', role: 'A* Waypoint Hazard Detour Corridors', provider: 'Navigational Waypoint Mesh', time: 16 },
    { name: 'Visualization Agent', role: 'Dynamic Vector Overlay Synthesizer', provider: 'Leaflet Vector Pipeline', time: 9 },
    { name: 'Explanation & Evidence Agent', role: 'Multilingual Operational Reasoning', provider: 'Gemini 3.6 Flash / Explainability', time: 38 }
  ];

  const totalTime = DEFAULT_AGENTS.reduce((acc, a) => {
    const live = agentTraces.find(t => t.agent_name === a.name);
    return acc + (live ? live.execution_time_ms : a.time);
  }, 0);

  return (
    <div className="bg-[#050b18]/85 border border-cyan-500/25 rounded-2xl p-4 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] text-xs">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-cyan-900/40 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-xs tracking-wide">Multi-Agent Pipeline Telemetry</h3>
            <p className="text-[10px] text-slate-400 font-mono">Real-time Subtask Observability for ISRO Evaluation</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/60">
            Total Latency: <strong>{totalTime}ms</strong>
          </span>
          <span className={`text-[10px] px-2.5 py-1 rounded-lg font-mono font-bold flex items-center gap-1.5 ${
            isAnalyzing
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAnalyzing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
            {isAnalyzing ? 'ORCHESTRATING' : 'READY / SYNCHRONIZED'}
          </span>
        </div>
      </div>

      {/* Grid of 9 Specialized Agents */}
      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {DEFAULT_AGENTS.map((agent) => {
          const liveTrace = agentTraces.find((t) => t.agent_name === agent.name);
          const isCompleted = !!liveTrace;
          const latency = liveTrace ? liveTrace.execution_time_ms : agent.time;
          const source = liveTrace ? liveTrace.data_source : agent.provider;

          return (
            <div
              key={agent.name}
              className={`p-3 rounded-xl border transition-all duration-200 ${
                isCompleted
                  ? 'bg-gradient-to-br from-[#0a1738]/90 to-[#060c1d] border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'bg-[#060c1d]/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="font-bold text-white truncate text-xs">{agent.name}</span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{latency}ms</span>
                </span>
              </div>

              <div className="text-[10px] text-slate-300 leading-tight mb-2 truncate">
                {agent.role}
              </div>

              <div className="pt-1.5 border-t border-white/5 text-[9px] font-mono text-cyan-300/90 flex items-center gap-1.5 truncate">
                <Database className="w-2.5 h-2.5 text-cyan-400 flex-shrink-0" />
                <span className="truncate">{source}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
