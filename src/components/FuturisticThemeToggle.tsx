import React from 'react';
import { Moon, Sun, Sparkles, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface FuturisticThemeToggleProps {
  compact?: boolean;
}

export const FuturisticThemeToggle: React.FC<FuturisticThemeToggleProps> = ({ compact = false }) => {
  const { isDark, toggleTheme } = useTheme();

  const playFuturisticSound = (toDark: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (toDark) {
        // Futuristic Cyber stealth power-down sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        // Solar photon crystal energize chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, audioCtx.currentTime);
        osc.frequency.setValueAtTime(520, audioCtx.currentTime + 0.08);
        osc.frequency.setValueAtTime(780, audioCtx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.32);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.32);
      }
    } catch (e) {}
  };

  const handleToggle = () => {
    playFuturisticSound(!isDark);
    toggleTheme();
  };

  if (compact) {
    return (
      <button
        id="btn-theme-toggle-compact"
        onClick={handleToggle}
        title={isDark ? 'Cambiar a Interfaz Blanca (Modo Claro)' : 'Cambiar a Interfaz Oscura (Cyber Dark)'}
        className={`relative p-2.5 rounded-xl border transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95 group ${
          isDark
            ? 'bg-slate-900/90 text-cyan-300 border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_22px_rgba(6,182,212,0.4)]'
            : 'bg-white text-amber-500 border-amber-400/40 hover:border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:shadow-[0_0_22px_rgba(245,158,11,0.45)]'
        }`}
      >
        {isDark ? (
          <Moon className="w-4 h-4 transition-transform group-hover:rotate-12 animate-pulse" />
        ) : (
          <Sun className="w-4 h-4 transition-transform group-hover:rotate-45 animate-spin-slow" />
        )}
      </button>
    );
  }

  return (
    <button
      id="btn-theme-toggle"
      onClick={handleToggle}
      title={isDark ? 'Activar Interfaz Totalmente Blanca' : 'Activar Interfaz Oscura Haute Tech'}
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border transition-all duration-400 cursor-pointer select-none group transform hover:scale-[1.03] active:scale-[0.98] ${
        isDark
          ? 'bg-gradient-to-r from-[#0B1320] via-[#0F172A] to-[#131E33] border-cyan-500/40 shadow-[0_0_18px_rgba(6,182,212,0.25),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.45)]'
          : 'bg-gradient-to-r from-white via-slate-50 to-blue-50/50 border-amber-400/50 shadow-[0_4px_16px_rgba(245,158,11,0.2),inset_0_1px_1px_rgba(255,255,255,0.9)] hover:border-amber-500 hover:shadow-[0_6px_24px_rgba(245,158,11,0.35)]'
      }`}
    >
      {/* Laser Edge Shimmer Line */}
      <div 
        className={`absolute inset-x-2 -top-[1px] h-[1px] bg-gradient-to-r ${
          isDark 
            ? 'from-transparent via-cyan-400/80 to-transparent' 
            : 'from-transparent via-amber-400/80 to-transparent'
        }`} 
      />

      {/* Cybernetic Capsule Switch Container */}
      <div 
        className={`relative w-12 h-6 rounded-full p-0.5 flex items-center transition-colors duration-300 ${
          isDark 
            ? 'bg-slate-950/90 border border-cyan-500/30 shadow-inner' 
            : 'bg-slate-200/90 border border-amber-400/40 shadow-inner'
        }`}
      >
        {/* Background icon track */}
        <div className="absolute inset-0 px-1.5 flex items-center justify-between text-[10px] pointer-events-none">
          <Moon className={`w-3 h-3 ${isDark ? 'text-cyan-400/50' : 'text-slate-400'}`} />
          <Sun className={`w-3 h-3 ${!isDark ? 'text-amber-500/50' : 'text-slate-600'}`} />
        </div>

        {/* Sliding Quantum Core / Knob */}
        <div
          className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ease-out transform shadow-md ${
            isDark
              ? 'translate-x-0 bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.8)]'
              : 'translate-x-6 bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.9)]'
          }`}
        >
          {isDark ? (
            <Moon className="w-3 h-3 text-slate-950 fill-slate-950" />
          ) : (
            <Sun className="w-3 h-3 text-slate-950 fill-slate-950 animate-spin-slow" />
          )}
        </div>
      </div>

      {/* Futuristic Mode Text & Live Telemetry Dot */}
      <div className="flex flex-col items-start text-left leading-none pr-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              isDark ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,1)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)]'
            }`}
          />
          <span 
            className={`text-[9.5px] font-black tracking-widest uppercase font-mono ${
              isDark ? 'text-cyan-300' : 'text-slate-800'
            }`}
          >
            {isDark ? 'CYBER DARK' : 'BLANCO'}
          </span>
        </div>
        <span 
          className={`text-[8.5px] font-semibold tracking-wider uppercase mt-0.5 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {isDark ? 'Interfaz Oscura' : 'Modo Blanco'}
        </span>
      </div>

      {/* Ambient particle spark on hover */}
      <Sparkles 
        className={`w-3 h-3 transition-opacity duration-200 ${
          isDark 
            ? 'text-cyan-400 opacity-60 group-hover:opacity-100' 
            : 'text-amber-500 opacity-60 group-hover:opacity-100'
        }`} 
      />
    </button>
  );
};
