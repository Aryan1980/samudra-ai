import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Volume2,
  VolumeX,
  Layers,
  Database,
  Info,
  TrendingUp,
  Radio,
  Sliders,
  Sparkles,
  Satellite,
  Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: '?????? (Hindi)' },
  { code: 'ta', name: '????? (Tamil)' },
  { code: 'te', name: '?????? (Telugu)' },
  { code: 'ml', name: '?????? (Malayalam)' },
  { code: 'kn', name: '????? (Kannada)' },
  { code: 'bn', name: '????? (Bengali)' },
  { code: 'mr', name: '????? (Marathi)' },
  { code: 'gu', name: '??????? (Gujarati)' },
  { code: 'or', name: '????? (Odia)' },
];

export const Header: React.FC = () => {
  const {
    activeLocation,
    activeLocationName,
    language,
    activeTab,
    soundEnabled,
    coastalPresets,
    setActiveLocation,
    setLanguage,
    setActiveTab,
    setSoundEnabled
  } = useApp();

  const [showCoordModal, setShowCoordModal] = useState(false);
  const [inputLat, setInputLat] = useState(activeLocation.latitude.toString());
  const [inputLon, setInputLon] = useState(activeLocation.longitude.toString());
  const [tickerTime, setTickerTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTickerTime(now.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleApplyCoords = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(inputLat);
    const lon = parseFloat(inputLon);
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      setActiveLocation({ latitude: lat, longitude: lon }, `Custom: ${lat.toFixed(4)}?N, ${lon.toFixed(4)}?E`);
      setShowCoordModal(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      {/* Top Telemetry Ticker Ribbon */}
      <div className="bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border-b border-cyan-900/30 px-4 py-1 flex items-center justify-between text-[10px] font-mono text-cyan-400/90">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <span className="flex items-center gap-1.5 font-bold tracking-wider text-cyan-300">
            <Satellite className="w-3 h-3 text-cyan-400 animate-pulse" />
            ISRO OCEANSAT-3 (EOS-06)
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 truncate hidden sm:inline">
            ACTIVE SENSOR: OCM-3 HYPERSPECTRAL ? SWELL RADAR 14.8 KM/H ? GEMINI 3.6 FLASH REASONING ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            LIVE SENSORS
          </span>
          <span className="text-slate-300 font-mono tracking-widest">{tickerTime}</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Branding & Logo with Holographic Glow */}
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('command')}>
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] transition-all duration-300">
            <div className="w-full h-full bg-[#050b18] rounded-[10px] flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent pointer-events-none" />
              <Compass className="w-5 h-5 text-cyan-300 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 font-sans">
                SAMUDRA<span className="text-cyan-400">AI</span>
              </h1>
              <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-900/60 to-cyan-900/60 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                ISRO 2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-wide font-medium">
              Agentic Marine Intelligence & Dynamic Risk Matrix
            </p>
          </div>
        </div>

        {/* View Switcher Tabs (Futuristic Segmented Controls) */}
        <div className="flex items-center bg-[#070e20] p-1 rounded-xl border border-cyan-900/40 shadow-inner text-xs">
          <button
            onClick={() => setActiveTab('command')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'command'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Command Center</span>
          </button>
          
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'trends'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>24h Trends</span>
          </button>

          <button
            onClick={() => setActiveTab('data_sources')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'data_sources'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Data Sources</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Architecture</span>
          </button>
        </div>

        {/* Tactical Controls: Coastal Presets, Language, Audio */}
        <div className="flex items-center gap-2.5">
          
          {/* Coastal Hub Selector */}
          <div className="flex items-center bg-[#070e20] border border-cyan-900/50 hover:border-cyan-500/60 rounded-xl px-3 py-1.5 text-xs transition-all shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 mr-1.5 flex-shrink-0 animate-bounce" />
            <select
              value={coastalPresets.find(p => p.name.includes(activeLocationName.split(',')[0]))?.id || ''}
              onChange={(e) => {
                const selected = coastalPresets.find(p => p.id === e.target.value);
                if (selected) {
                  setActiveLocation({ latitude: selected.latitude, longitude: selected.longitude }, `${selected.name}, ${selected.state}`);
                }
              }}
              className="bg-transparent text-slate-200 outline-none cursor-pointer max-w-[140px] truncate font-medium"
            >
              <option value="" disabled className="bg-slate-900 text-slate-400">Select Harbor</option>
              {coastalPresets.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.name}
                </option>
              ))}
            </select>

            <button
              title="Enter custom latitude/longitude"
              onClick={() => setShowCoordModal(true)}
              className="ml-2 text-slate-400 hover:text-cyan-300 p-0.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Regional Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#070e20] border border-cyan-900/50 hover:border-cyan-500/60 text-slate-200 font-medium rounded-xl px-3 py-1.5 text-xs outline-none cursor-pointer transition-all shadow-sm"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-slate-200">
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Audio Waveform Readout Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute voice synthesis" : "Enable voice synthesis"}
            className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
              soundEnabled
                ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-[#070e20] border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

        </div>

      </div>

      {/* Coordinate Modal */}
      {showCoordModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 to-[#050b18] border border-cyan-500/40 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(6,182,212,0.25)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" /> Custom Marine Coordinate
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter decimal latitude and longitude anywhere in the Arabian Sea, Bay of Bengal, or Indian Ocean.
            </p>
            <form onSubmit={handleApplyCoords} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-slate-300 mb-1 font-mono">Latitude (?N):</label>
                <input
                  type="number"
                  step="0.0001"
                  value={inputLat}
                  onChange={(e) => setInputLat(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono outline-none focus:border-cyan-400"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 mb-1 font-mono">Longitude (?E):</label>
                <input
                  type="number"
                  step="0.0001"
                  value={inputLon}
                  onChange={(e) => setInputLon(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono outline-none focus:border-cyan-400"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCoordModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-900/40 cursor-pointer"
                >
                  Set Coordinate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </header>
  );
};
