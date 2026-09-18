import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Mail, 
  FileSpreadsheet,
  Activity,
  Clock,
  LogOut,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { GoogleSheetsConfig, AuthUser } from '../types';

interface SidebarProps {
  currentView: 'dashboard' | 'tasks' | 'workers' | 'emails' | 'sheets';
  setCurrentView: (view: 'dashboard' | 'tasks' | 'workers' | 'emails' | 'sheets') => void;
  sheetsConfig: GoogleSheetsConfig;
  activeAutomationsCount: number;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  sheetsConfig,
  activeAutomationsCount,
  currentUser,
  onLogout,
}) => {
  const operationsNav = [
    {
      id: 'dashboard',
      label: 'Panel de Rendimiento',
      sublabel: 'KPIs y Métricas Globales',
      icon: LayoutDashboard,
    },
    {
      id: 'tasks',
      label: 'Programación & Tareas',
      sublabel: 'Cronograma y Kanban',
      icon: CheckSquare,
    },
    {
      id: 'workers',
      label: 'Perfiles de Equipo',
      sublabel: 'Rendimiento y Face ID',
      icon: Users,
    },
  ];

  const automationNav = [
    {
      id: 'sheets',
      label: 'Google Sheets Hub',
      sublabel: 'Sincronización Multi-Tab',
      icon: FileSpreadsheet,
      accent: 'emerald',
      badge: 'Live',
    },
    {
      id: 'emails',
      label: 'Reportes Automáticos',
      sublabel: 'Despacho & Alertas SMTP',
      icon: Mail,
      accent: 'blue',
      badge: activeAutomationsCount > 0 ? `${activeAutomationsCount} act.` : null,
    },
  ];

  return (
    <aside 
      id="sidebar-nav" 
      className="w-68 bg-[#080C15]/95 backdrop-blur-2xl text-slate-100 flex flex-col shrink-0 select-none border-r border-slate-800/80 relative z-30 transition-all duration-300"
    >
      {/* Ambient glowing radial top accent */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent pointer-events-none" />

      {/* ================= BRAND HEADER ================= */}
      <div className="p-4.5 border-b border-slate-800/70 relative">
        <div className="flex items-center gap-3">
          {/* Executive Monogram Badge */}
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 p-[1px] shadow-lg shadow-blue-500/15">
              <div className="w-full h-full rounded-[11px] bg-[#070B14] flex items-center justify-center font-black text-xs tracking-wider text-white">
                STF
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#080C15]"></span>
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h1 className="text-sm font-extrabold tracking-tight text-white leading-none">
                STF<span className="text-blue-400 font-bold">GROUP</span>
              </h1>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 font-extrabold uppercase font-mono tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-semibold tracking-widest uppercase mt-1 truncate">
              STUDIO F • ELA • SF MAN
            </p>
          </div>
        </div>
      </div>

      {/* ================= NAVIGATION SECTIONS ================= */}
      <nav className="flex-1 py-3.5 px-3 space-y-5 overflow-y-auto custom-scrollbar">
        
        {/* Section 1: Operaciones */}
        <div>
          <div className="px-3 mb-1.5 text-[9.5px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
            <span>Operaciones & Control</span>
            <Layers className="w-3 h-3 text-slate-400" />
          </div>

          <div className="space-y-1">
            {operationsNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}-btn`}
                  onClick={() => setCurrentView(item.id as any)}
                  className={`w-full group flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-200 cursor-pointer relative ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-transparent text-white border border-blue-500/30 shadow-sm shadow-blue-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                      : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold leading-tight truncate ${isActive ? 'text-white font-bold' : 'text-slate-200'}`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {item.sublabel}
                    </p>
                  </div>

                  {isActive && (
                    <div className="w-1.5 h-4 rounded-full bg-blue-500 shadow-sm shadow-blue-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Automatizaciones */}
        <div>
          <div className="px-3 mb-1.5 text-[9.5px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
            <span>Bases & Automatización</span>
            <Zap className="w-3 h-3 text-slate-400" />
          </div>

          <div className="space-y-1">
            {automationNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isEmerald = item.accent === 'emerald';
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}-btn`}
                  onClick={() => setCurrentView(item.id as any)}
                  className={`w-full group flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-200 cursor-pointer relative ${
                    isActive
                      ? isEmerald 
                        ? 'bg-gradient-to-r from-emerald-600/20 via-emerald-600/10 to-transparent text-white border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                        : 'bg-gradient-to-r from-blue-600/20 via-indigo-600/10 to-transparent text-white border border-blue-500/30 shadow-sm shadow-blue-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isActive 
                      ? isEmerald ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30' : 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-semibold leading-tight truncate ${isActive ? 'text-white font-bold' : 'text-slate-200'}`}>
                        {item.label}
                      </p>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          isEmerald 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {item.sublabel}
                    </p>
                  </div>

                  {isActive && (
                    <div className={`w-1.5 h-4 rounded-full shadow-sm ${
                      isEmerald ? 'bg-emerald-500 shadow-emerald-400' : 'bg-blue-500 shadow-blue-400'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ================= COMPACT LIVE TELEMETRY DOCK ================= */}
      <div className="p-2.5 mx-3 mb-2.5 bg-slate-900/90 border border-slate-800/90 rounded-xl relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-slate-200 tracking-tight">
              Google Sheets Live
            </span>
          </div>
          <span className="text-[9.5px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
            5 Hojas
          </span>
        </div>

        <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1 font-mono text-[9.5px]">
            <Clock className="w-3 h-3 text-slate-400" />
            {sheetsConfig.lastSyncedAt || 'En vivo'}
          </span>
          <span className="font-mono text-[9.5px] text-blue-300">
            Cron 18:00
          </span>
        </div>
      </div>

      {/* ================= USER SESSION FOOTER ================= */}
      {currentUser && (
        <div className="p-3 border-t border-slate-800/80 bg-[#060910]/95 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className={`w-8 h-8 rounded-lg ${currentUser.avatarColor || 'bg-blue-600 text-white'} flex items-center justify-center font-bold text-xs shadow-sm border border-white/10`}>
                {currentUser.initials}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 text-black" title="Face ID Verificado">
                <ShieldCheck className="w-2.5 h-2.5 text-white" />
              </span>
            </div>
            
            <div className="min-w-0 text-left">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {currentUser.role || 'Control Operativo'}
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              title="Cerrar Sesión Segura"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer shrink-0 border border-transparent hover:border-rose-500/20 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </aside>
  );
};
