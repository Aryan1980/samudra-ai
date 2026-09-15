import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  HelpCircle,
  Shield,
  Compass,
  Volume2,
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DemoQueries } from './DemoQueries';
import { EvidenceDrawer } from './EvidenceDrawer';
import { voiceService } from '../../services/voice';
import { EvidenceDetails, AgentTrace } from '../../types/marine';

export const ChatPanel: React.FC = () => {
  const {
    chatMessages,
    isAnalyzing,
    language,
    soundEnabled,
    sendQuery
  } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeEvidence, setActiveEvidence] = useState<EvidenceDetails | null>(null);
  const [activeTraces, setActiveTraces] = useState<AgentTrace[] | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAnalyzing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isAnalyzing) return;
    const q = inputQuery;
    setInputQuery('');
    sendQuery(q);
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      voiceService.startListening(
        language,
        (transcript) => {
          setInputQuery(transcript);
          setIsListening(false);
          sendQuery(transcript);
        },
        (err) => {
          console.warn('Voice error:', err);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050b18]/80 backdrop-blur-xl rounded-2xl border border-cyan-500/25 shadow-[0_0_35px_rgba(0,0,0,0.5)] overflow-hidden">
      
      {/* 1. Interactive Demo Scenarios Ribbon */}
      <DemoQueries />

      {/* 2. Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-grid-pattern">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar with Halo */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                  isUser
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-900/40'
                    : 'bg-gradient-to-tr from-cyan-500 to-blue-700 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-300/40'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4.5 h-4.5" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[88%] rounded-2xl p-4 shadow-xl transition-all duration-200 ${
                  isUser
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none border border-blue-400/30'
                    : 'bg-[#09142e]/90 border border-cyan-500/20 text-slate-100 rounded-tl-none shadow-[0_4px_25px_rgba(0,0,0,0.4)]'
                }`}
              >
                {/* Safety verdict header for assistant */}
                {!isUser && msg.safety_verdict && (
                  <div className="mb-3 flex items-center justify-between gap-2 pb-2 border-b border-cyan-900/40">
                    <span
                      className={`inline-flex items-center gap-1.5 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        msg.safety_verdict === 'SAFE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                          : msg.safety_verdict === 'SAFE_WITH_CAUTION'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      {msg.safety_verdict.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{msg.timestamp}</span>
                  </div>
                )}

                {/* Message Content */}
                <div className="whitespace-pre-line leading-relaxed text-[11px] font-normal text-slate-200">
                  {msg.content}
                </div>

                {/* Attached Actions: Evidence Drawer Button */}
                {!isUser && (
                  <div className="mt-3 pt-2.5 border-t border-cyan-900/30 flex flex-wrap items-center justify-between gap-2">
                    {msg.evidence ? (
                      <button
                        onClick={() => {
                          setActiveEvidence(msg.evidence || null);
                          setActiveTraces(msg.traces);
                        }}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-600/40 px-3 py-1 rounded-lg transition-all shadow-sm cursor-pointer"
                      >
                        <HelpCircle className="w-3 h-3 text-cyan-400" />
                        <span>Why am I seeing this? (Evidence Trail)</span>
                      </button>
                    ) : <div />}

                    {soundEnabled && (
                      <button
                        onClick={() => voiceService.speak(msg.content, language)}
                        className="text-slate-400 hover:text-cyan-300 p-1.5 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
                        title="Listen aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Multi-Agent Orchestration Loading Indicator */}
        {isAnalyzing && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-700 text-white flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.6)] flex-shrink-0 animate-pulse">
              <Activity className="w-4.5 h-4.5 animate-spin" />
            </div>
            <div className="bg-[#09142e]/90 border border-cyan-500/30 rounded-2xl rounded-tl-none p-4 shadow-xl max-w-[85%]">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-[11px]">
                <Compass className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>SamudraAI Multi-Agent Pipeline Active...</span>
              </div>
              <div className="mt-2 text-[10px] text-slate-300 space-y-1 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span>Weather & Ocean Analytics Ingestion...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Computing deterministic 6-factor risk matrix...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>Gemini 3.6 Flash synthesizing multilingual advisory...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Voice Recording Audio Wave Visualizer & Input Form */}
      <div className="p-3 border-t border-cyan-900/30 bg-[#030712]/90 backdrop-blur-xl">
        
        {/* Animated Sound Waveform while listening */}
        {isListening && (
          <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-rose-950/50 border border-rose-600/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Listening to Voice Input... Speak in {language.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(6)].map((_, i) => (
                <span
                  key={i}
                  className="w-1 bg-rose-400 rounded-full animate-bounce"
                  style={{ height: `${8 + (i % 3) * 6}px`, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
          
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            title={isListening ? 'Stop recording' : 'Speak query via Microphone'}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse'
                : 'bg-[#09142e] border-cyan-900/50 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/60 shadow-sm'
            }`}
          >
            {isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
          </button>

          {/* Text Input with Holographic Focus Ring */}
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={isListening ? 'Listening to voice...' : 'Ask about PFZ, sea conditions, wave forecast, or safe route...'}
            disabled={isAnalyzing}
            className="flex-1 bg-[#09142e]/90 border border-cyan-900/50 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 outline-none transition-all font-sans"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputQuery.trim() || isAnalyzing}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>

      {/* Evidence Modal / Drawer */}
      <EvidenceDrawer
        evidence={activeEvidence}
        traces={activeTraces}
        onClose={() => setActiveEvidence(null)}
      />

    </div>
  );
};
