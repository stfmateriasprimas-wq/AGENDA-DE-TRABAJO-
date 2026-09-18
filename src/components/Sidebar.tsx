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
  ChevronRight,
  Sparkles,
  Zap,
  Layers
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
  const navItems = [
    {
      id: 'dashboard',
      label: 'Panel de Control',
      sublabel: 'KPIs y Eficiencia Global',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'tasks',
      label: 'Programación & Tareas',
      sublabel: 'Kanban y Cronograma',
      icon: CheckSquare,
      badge: null,
    },
    {
      id: 'workers',
      label: 'Perfiles de Equipo',
      sublabel: 'Rendimiento & Face ID',
      icon: Users,
      badge: null,
    },
  ];

  const automationItems = [
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
      className="w-72 bg-[#090D16]/95 backdrop-blur-xl text-slate-100 flex flex-col shrink-0 select-none border-r border-slate-800/80 relative z-30 transition-all duration-300"
    >
      {/* Glow decorative accent behind header */}
      <div className="absolute top-0 left-0 right-0 h-28 bg-radial from-blue-600/10 via-transparent to-transparent pointer-events-none" />

      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/60 relative">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 border border-blue-500/30 flex items-center justify-center text-white shadow-lg shadow-blue-500/10 font-black text-sm tracking-wider">
              STF
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#090D16]"></span>
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-tight text-white leading-none">
                STF<span className="text-blue-400 font-semibold">GROUP</span>
              </h1>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-500/30 text-blue-300 font-bold uppercase tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-[9.5px] text-slate-400 font-medium tracking-widest uppercase mt-1">
              STUDIO F • ela • SF MAN
            </p>
          </div>
        </div>

        {/* System Tag */}
        <div className="mt-3.5 flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800/80">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Control Operativo
          </span>
          <span className="font-mono text-[9px] text-blue-400 font-semibold bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
            v3.2 Enterprise
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {/* Section 1: Gestión */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Operaciones & Control</span>
            <Layers className="w-3 h-3 text-slate-400" />
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}-btn`}
                  onClick={() => setCurrentView(item.id as any)}
                  className={`w-full group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/25 to-indigo-600/15 text-white border border-blue-500/40 shadow-sm shadow-blue-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30' 
                      : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold leading-tight ${isActive ? 'text-white' : 'text-slate-200'}`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {item.sublabel}
                    </p>
                  </div>

                  {isActive && (
                    <div className="w-1.5 h-4 rounded-full bg-blue-500 shadow-sm shadow-blue-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Integraciones */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Bases & Automatización</span>
            <Zap className="w-3 h-3 text-slate-400" />
          </div>

          <div className="space-y-1">
            {automationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isEmerald = item.accent === 'emerald';
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}-btn`}
                  onClick={() => setCurrentView(item.id as any)}
                  className={`w-full group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                    isActive
                      ? isEmerald 
                        ? 'bg-emerald-500/15 text-white border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                        : 'bg-blue-600/20 text-white border border-blue-500/30 shadow-sm shadow-blue-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${
                    isActive 
                      ? isEmerald ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                      : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-semibold leading-tight ${isActive ? 'text-white' : 'text-slate-200'}`}>
                        {item.label}
                      </p>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
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
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* System Status Telemetry Card */}
      <div className="p-3 mx-3 mb-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Telemetría en Vivo
          </span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        
        <div className="space-y-1 text-[10px] text-slate-400 font-medium">
          <div className="flex justify-between items-center bg-slate-950/40 px-2 py-1 rounded">
            <span>Google Sheets:</span>
            <span className="text-emerald-400 font-semibold font-mono">Conectado (5 Hojas)</span>
          </div>
          <div className="flex justify-between items-center bg-slate-950/40 px-2 py-1 rounded">
            <span>Cron Despacho:</span>
            <span className="text-blue-300 font-semibold font-mono">Diario 18:00</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> Sincronizado:</span>
            <span className="font-mono text-slate-300 text-[9.5px]">{sheetsConfig.lastSyncedAt || 'En vivo'}</span>
          </div>
        </div>
      </div>

      {/* User Session Footer */}
      {currentUser && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="relative">
              <div className={`w-9 h-9 rounded-xl ${currentUser.avatarColor || 'bg-blue-600 text-white'} flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-white/10`}>
                {currentUser.initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full p-0.5 text-[#090D16]" title="Face ID Verificado">
                <ShieldCheck className="w-2.5 h-2.5 text-white" />
              </span>
            </div>
            
            <div className="truncate text-left">
              <div className="flex items-center gap-1">
                <p className="text-xs font-bold text-slate-100 truncate">{currentUser.name}</p>
              </div>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.role}</p>
            </div>
          </div>

          {onLogout && (
            <button
              id="sidebar-logout-btn"
              onClick={onLogout}
              title="Cerrar Sesión Segura"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer shrink-0 border border-transparent hover:border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </aside>
  );
};
