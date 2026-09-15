import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Coordinates,
  MarineObservation,
  WeatherReport,
  PFZZone,
  MarineAlert,
  RiskAssessment,
  RouteComparison,
  ChatMessage,
  EvidenceDetails,
  AgentTrace,
  CoastalPreset
} from '../types/marine';
import { api } from '../services/api';
import { voiceService } from '../services/voice';

export interface AppContextType {
  activeLocation: Coordinates;
  activeLocationName: string;
  language: string;
  activeTab: 'command' | 'data_sources' | 'architecture' | 'trends';
  activeMapLayers: string[];
  weather: WeatherReport | null;
  ocean: MarineObservation | null;
  risk: RiskAssessment | null;
  pfzs: PFZZone[];
  alerts: MarineAlert[];
  routeComparison: RouteComparison | null;
  chatMessages: ChatMessage[];
  activeEvidence: EvidenceDetails | null;
  agentTraces: AgentTrace[];
  isAnalyzing: boolean;
  isVoiceActive: boolean;
  soundEnabled: boolean;
  coastalPresets: CoastalPreset[];
  
  // Actions
  setActiveLocation: (coords: Coordinates, name?: string) => void;
  setLanguage: (lang: string) => void;
  setActiveTab: (tab: 'command' | 'data_sources' | 'architecture' | 'trends') => void;
  toggleMapLayer: (layerId: string) => void;
  setSoundEnabled: (val: boolean) => void;
  sendQuery: (queryText: string) => Promise<void>;
  routeToPFZ: (pfz: PFZZone) => Promise<void>;
  setActiveEvidence: (ev: EvidenceDetails | null) => void;
  refreshConditions: () => Promise<void>;
}

const DEFAULT_COORDS: Coordinates = { latitude: 9.9312, longitude: 76.2673 };
const DEFAULT_NAME = 'Kochi (Cochin), Kerala';

const DEFAULT_LAYERS = ['pfz', 'waves', 'imbl', 'risk_zones'];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeLocation, setActiveLocationState] = useState<Coordinates>(DEFAULT_COORDS);
  const [activeLocationName, setActiveLocationName] = useState<string>(DEFAULT_NAME);
  const [language, setLanguage] = useState<string>('en');
  const [activeTab, setActiveTab] = useState<'command' | 'data_sources' | 'architecture' | 'trends'>('command');
  const [activeMapLayers, setActiveMapLayers] = useState<string[]>(DEFAULT_LAYERS);
  const [weather, setWeather] = useState<WeatherReport | null>(null);
  const [ocean, setOcean] = useState<MarineObservation | null>(null);
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [pfzs, setPfzs] = useState<PFZZone[]>([]);
  const [alerts, setAlerts] = useState<MarineAlert[]>([]);
  const [routeComparison, setRouteComparison] = useState<RouteComparison | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: 'Welcome to SamudraAI ? ISRO Agentic Marine Intelligence Platform.\nAsk questions in 10 Indian languages about Potential Fishing Zones (PFZs), marine weather, swell, safe routing, or boundary geofences.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      risk_level: 'LOW',
      safety_verdict: 'SAFE'
    }
  ]);
  const [activeEvidence, setActiveEvidence] = useState<EvidenceDetails | null>(null);
  const [agentTraces, setAgentTraces] = useState<AgentTrace[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [coastalPresets, setCoastalPresets] = useState<CoastalPreset[]>([]);

  // Load geofences & coastal presets
  useEffect(() => {
    api.getGeofences().then((data) => {
      if (data && data.coastal_presets) {
        setCoastalPresets(data.coastal_presets);
      }
    }).catch(console.error);
  }, []);

  // Refresh marine conditions whenever active location changes
  const refreshConditions = async (loc = activeLocation) => {
    setIsAnalyzing(true);
    try {
      const data = await api.getMarineConditions(loc);
      setWeather(data.weather);
      setOcean(data.ocean);
      setRisk(data.risk);
      setAlerts(data.active_alerts || []);
      const pfzList = await api.getPFZs(loc);
      setPfzs(pfzList);
    } catch (err) {
      console.error('Failed to refresh marine conditions:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    refreshConditions(activeLocation);
  }, [activeLocation.latitude, activeLocation.longitude]);

  const setActiveLocation = (coords: Coordinates, name?: string) => {
    setActiveLocationState(coords);
    if (name) {
      setActiveLocationName(name);
    } else {
      setActiveLocationName(`${coords.latitude.toFixed(4)}?N, ${coords.longitude.toFixed(4)}?E`);
    }
  };

  const toggleMapLayer = (layerId: string) => {
    setActiveMapLayers((prev) =>
      prev.includes(layerId) ? prev.filter((id) => id !== layerId) : [...prev, layerId]
    );
  };

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsAnalyzing(true);

    try {
      const resp = await api.sendChat(queryText, activeLocation, language, activeMapLayers);

      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: resp.direct_answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        risk_level: resp.risk_level,
        safety_verdict: resp.safety_verdict,
        evidence: resp.evidence,
        traces: resp.agent_traces,
        pfzs: resp.relevant_pfz || undefined,
        route: resp.route_comparison || undefined
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
      setActiveEvidence(resp.evidence);
      setAgentTraces(resp.agent_traces);

      if (resp.relevant_pfz && resp.relevant_pfz.length > 0) {
        setPfzs(resp.relevant_pfz);
      }
      if (resp.route_comparison) {
        setRouteComparison(resp.route_comparison);
        if (!activeMapLayers.includes('route')) {
          setActiveMapLayers((prev) => [...prev, 'route']);
        }
      }
      if (resp.alerts) {
        setAlerts(resp.alerts);
      }

      // Automatically activate recommended map layers
      if (resp.active_map_layers && resp.active_map_layers.length > 0) {
        setActiveMapLayers((prev) => Array.from(new Set([...prev, ...resp.active_map_layers])));
      }

      // Speak response if sound is enabled
      if (soundEnabled) {
        voiceService.speak(resp.direct_answer, language);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: 'System error connecting to agent orchestration pipeline. Please verify the backend service is active.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        risk_level: 'HIGH',
        safety_verdict: 'UNSAFE'
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const routeToPFZ = async (pfz: PFZZone) => {
    setIsAnalyzing(true);
    try {
      const routeRes = await api.calculateRoute(activeLocation, pfz.location);
      setRouteComparison(routeRes);
      if (!activeMapLayers.includes('route')) {
        setActiveMapLayers((prev) => [...prev, 'route']);
      }
      const navMsg: ChatMessage = {
        id: `nav_${Date.now()}`,
        role: 'assistant',
        content: `Navigational corridor plotted to **${pfz.name}** (${pfz.distance_km} km).\nShortest path: ${routeRes.shortest_route.distance_km} km (${routeRes.shortest_route.risk_level} risk).\nRecommended safe detour: ${routeRes.safe_route.distance_km} km (${routeRes.safe_route.risk_level} risk).\nReason: ${routeRes.reasoning}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        risk_level: routeRes.safe_route.risk_level as any,
        safety_verdict: routeRes.safe_route.risk_level === 'LOW' ? 'SAFE' : 'SAFE_WITH_CAUTION',
        route: routeRes
      };
      setChatMessages((prev) => [...prev, navMsg]);
      if (soundEnabled) {
        voiceService.speak(navMsg.content, language);
      }
    } catch (err) {
      console.error('Routing failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeLocation,
        activeLocationName,
        language,
        activeTab,
        activeMapLayers,
        weather,
        ocean,
        risk,
        pfzs,
        alerts,
        routeComparison,
        chatMessages,
        activeEvidence,
        agentTraces,
        isAnalyzing,
        isVoiceActive,
        soundEnabled,
        coastalPresets,
        setActiveLocation,
        setLanguage,
        setActiveTab,
        toggleMapLayer,
        setSoundEnabled,
        sendQuery,
        routeToPFZ,
        setActiveEvidence,
        refreshConditions
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
