import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header/Header';
import { MarineMap } from './components/Map/MarineMap';
import { ChatPanel } from './components/Chat/ChatPanel';
import { MarineCards } from './components/Dashboard/MarineCards';
import { RiskBadge } from './components/Dashboard/RiskBadge';
import { PFZList } from './components/Dashboard/PFZList';
import { AlertCenter } from './components/Dashboard/AlertCenter';
import { AgentTracePanel } from './components/Observability/AgentTracePanel';
import { ArchitectureView } from './components/Pages/ArchitectureView';
import { DataSourcesView } from './components/Pages/DataSourcesView';
import { MarineTrendsModal } from './components/Charts/MarineTrendsModal';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />

      <main className="flex-1 overflow-y-auto p-3.5 space-y-3.5 max-w-7xl mx-auto w-full">
        
        {/* Tab 1: Command Center */}
        {activeTab === 'command' && (
          <>
            {/* Top Row: Key Marine Metrics Cards & Deterministic Risk Gauge */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-stretch">
              <div className="lg:col-span-2 flex flex-col justify-between">
                <MarineCards />
              </div>
              <div className="lg:col-span-1">
                <RiskBadge />
              </div>
            </div>

            {/* Core Interactive Section: Marine Leaflet Map (Left) + Multi-Turn Agentic Chat (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 min-h-[520px]">
              {/* Map: 7 cols on desktop */}
              <div className="lg:col-span-7 h-[520px]">
                <MarineMap />
              </div>

              {/* Conversational Assistant: 5 cols on desktop */}
              <div className="lg:col-span-5 h-[520px]">
                <ChatPanel />
              </div>
            </div>

            {/* Tactical Panels: Ranked PFZs (Left) + Active Alerts (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch">
              <div className="h-72">
                <PFZList />
              </div>
              <div className="h-72">
                <AlertCenter />
              </div>
            </div>

            {/* Live Observability / Multi-Agent Telemetry Bar */}
            <AgentTracePanel />
          </>
        )}

        {/* Tab 2: 24h Trends */}
        {activeTab === 'trends' && <MarineTrendsModal />}

        {/* Tab 3: Data Sources Provenance */}
        {activeTab === 'data_sources' && <DataSourcesView />}

        {/* Tab 4: System Architecture & "How It Works" */}
        {activeTab === 'architecture' && <ArchitectureView />}

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-2.5 px-4 text-center text-[10px] text-slate-500">
        <span>SamudraAI ? Operational Decision-Support Prototype for ISRO Evaluation ? Developed with Deterministic Safety Grounding</span>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-[#060b19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
        <MainContent />
      </div>
    </AppProvider>
  );
}
