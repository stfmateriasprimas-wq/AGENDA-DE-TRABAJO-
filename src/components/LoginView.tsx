import React, { useState } from 'react';
import { 
  User, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Worker, AuthUser } from '../types';

interface LoginViewProps {
  workers?: Worker[];
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
}) => {
  // Input starts empty for a clean, non-cluttered look as requested
  const [documentInput, setDocumentInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // The ONLY authorized user configured for STF GROUP: JOSE GUZMAN with cédula / clave 1073524622
  const AUTHORIZED_USER = {
    id: 'w-jose-guzman',
    name: 'JOSE GUZMAN',
    cedula: '1073524622',
    role: 'Director de Operaciones & Control de Colchas',
    department: 'Control & Trazabilidad STF',
    email: 'jose.guzman@stfgroup.com',
    initials: 'JG',
    avatarColor: 'bg-amber-500 text-slate-950 border-amber-400',
  };

  const playChime = (success: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (success) {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.setValueAtTime(160, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch (e) {}
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = documentInput.trim().replace(/\s+/g, '');
    const cleanDigits = documentInput.trim().replace(/\D/g, '');

    // Validate against JOSE GUZMAN cédula: 1073524622 or name
    if (
      cleanDigits === AUTHORIZED_USER.cedula ||
      cleanInput.toUpperCase() === AUTHORIZED_USER.name.replace(/\s+/g, '') ||
      cleanInput.toLowerCase() === 'jose' ||
      cleanInput.toLowerCase() === 'joseguzman'
    ) {
      setErrorMessage(null);
      setIsAuthenticating(true);
      playChime(true);

      try {
        confetti({
          particleCount: 55,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#FFFFFF'],
        });
      } catch (err) {}

      setTimeout(() => {
        onLoginSuccess({
          id: AUTHORIZED_USER.id,
          name: AUTHORIZED_USER.name,
          role: AUTHORIZED_USER.role,
          department: AUTHORIZED_USER.department,
          email: AUTHORIZED_USER.email,
          avatarColor: AUTHORIZED_USER.avatarColor,
          initials: AUTHORIZED_USER.initials,
          authMethod: 'document',
          documentId: AUTHORIZED_USER.cedula,
        });
      }, 450);
    } else {
      playChime(false);
      setErrorMessage('Acceso no autorizado. Ingrese su cédula o clave (1073524622).');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#05070B] overflow-hidden select-none font-sans text-slate-100 p-4">
      
      {/* Background with STF Group Headquarters Building */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-100 opacity-65 transition-opacity duration-700"
        style={{
          backgroundImage: `url('/stf-bg.jpg')`,
        }}
      />

      {/* Dark Vignette Overlay for High-End Cinematic Contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/45 to-black/90 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/50 to-black/95 pointer-events-none" />

      {/* ========================================================================= */}
      {/* CENTERED STACK: BRAND LOGO + POLARIZED GLASS CARD + FOOTER */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">

        {/* 1. TOP BRAND HEADER (Centered directly above the card) */}
        <header className="flex flex-col items-center justify-center text-center mb-6">
          <div className="inline-block border-b border-white/90 pb-1 px-2">
            <div className="flex items-center gap-1.5 justify-center">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase font-sans">
                STF<span className="font-light text-slate-200">GROUP</span>
              </span>
              <span className="text-[10px] text-slate-300 font-bold self-start mt-1 tracking-widest">
                S.A.
              </span>
            </div>
          </div>

          {/* Sub-Brands: STUDIO F • ela • STUDIO F MAN */}
          <div className="flex items-center gap-2.5 text-[11px] font-semibold tracking-widest uppercase text-white mt-2">
            <span>STUDIO F</span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="font-serif italic lowercase text-base font-normal tracking-normal text-white">ela</span>
            <span className="text-slate-400 text-xs">•</span>
            <span>STUDIO F <span className="text-[9px] text-slate-300 font-normal">MAN</span></span>
          </div>
        </header>

        {/* 2. POLARIZED TINTED GLASS LOGIN TERMINAL CARD */}
        {/* Estilo vidrio polarizado oscuro semi-transparente con backdrop-blur y bisel reflectante */}
        <div className="w-full relative rounded-3xl p-7 sm:p-8 bg-gradient-to-b from-white/[0.08] via-slate-950/50 to-black/75 backdrop-blur-2xl backdrop-saturate-150 border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.2)] overflow-hidden transition-all duration-300">
          
          {/* Subtle polarized glass sheen line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          {/* Top-left decorative polarized glass square tile */}
          <div className="absolute top-5 left-5 w-8 h-8 rounded-xl bg-gradient-to-br from-white/15 to-black/60 border border-white/20 shadow-inner flex items-center justify-center backdrop-blur-md">
            <div className="w-3 h-3 rounded-md bg-white/20 shadow-xs" />
          </div>

          {/* Welcome Title & Subtitle (Clean, with the "Terminal de acceso seguro" removed) */}
          <div className="text-center mb-6 pt-2">
            <h1 className="text-2xl sm:text-[27px] font-black text-white tracking-[0.22em] uppercase leading-tight font-sans drop-shadow-md">
              BIENVENIDO
            </h1>
            <p className="text-xs text-slate-300/85 mt-2 font-medium tracking-wide">
              Inicie sesión con su documento o perfil corporativo
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Input Field: Clean minimal polarized input (with redundant label rows and noisy placeholder removed) */}
            <div className="relative group">
              <User className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-focus-within:scale-110" />
              <input
                id="cedula-input"
                type="text"
                value={documentInput}
                onChange={(e) => {
                  setDocumentInput(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="••••••••••"
                className="w-full pl-10 pr-4 py-3.5 bg-black/45 backdrop-blur-md border border-white/15 focus:border-white/50 focus:ring-2 focus:ring-white/20 rounded-xl text-white text-xs sm:text-sm font-medium placeholder-slate-500 outline-none transition-all shadow-inner tracking-widest"
                autoFocus
              />
            </div>

            {/* Feedback Error Message if non-authorized user enters */}
            {errorMessage && (
              <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-center gap-2 animate-in fade-in backdrop-blur-md">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span className="leading-tight text-[11.5px]">{errorMessage}</span>
              </div>
            )}

            {/* White Submit Button: Con borde blanco brillante, leve zoom en hover y respuesta al click */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3.5 mt-3 bg-white hover:bg-slate-50 text-slate-950 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer select-none transition-all duration-300 ease-out transform border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.45),0_0_30px_rgba(255,255,255,0.15)] hover:scale-[1.04] hover:shadow-[0_0_25px_rgba(255,255,255,0.9),0_0_50px_rgba(255,255,255,0.35)] active:scale-[0.98] disabled:opacity-75"
            >
              <span>{isAuthenticating ? 'ACCEDIENDO...' : 'INGRESAR AL SISTEMA'}</span>
              <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.8] transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            {/* Card Footer Bar: CONEXIÓN SEGURA ENCRIPTADA (TLS) | STF v2.7 */}
            <div className="pt-4 mt-5 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold tracking-wider uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>CONEXIÓN SEGURA ENCRIPTADA (TLS)</span>
              </div>

              <span className="text-[9.5px] font-mono text-slate-300 border border-white/10 px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm font-medium">
                STF v2.7
              </span>
            </div>

          </form>

        </div>

        {/* 3. BOTTOM FOOTER (Directly below the card) */}
        <footer className="mt-6 text-center text-slate-400/80 text-[10px] tracking-widest uppercase font-medium px-4">
          SISTEMA DE CONTROL Y TRAZABILIDAD DE COLCHAS STF GROUP S.A. © 2026
        </footer>

      </div>

    </div>
  );
};
