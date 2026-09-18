import React, { useState } from 'react';
import { 
  Plus, 
  RefreshCw, 
  Search, 
  UserPlus,
  Bell,
  Clock,
  CheckCircle2, 
  X, 
  LogOut, 
  ShieldCheck, 
  Command,
  ChevronDown,
  LayoutDashboard,
  CheckSquare,
  Users,
  FileSpreadsheet,
  Mail,
  SlidersHorizontal
} from 'lucide-react';
import { Task, TimeFilter, AuthUser } from '../types';
import { getOverdueDurationText } from '../utils/deadlineAlert';
import { useTheme } from '../context/ThemeContext';
import { FuturisticThemeToggle } from './FuturisticThemeToggle';

interface HeaderProps {
  currentView: string;
  timeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenNewTaskModal: () => void;
  onOpenNewWorkerModal: () => void;
  onSyncGoogleSheets: () => void;
  isSyncing: boolean;
  overdueTasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  timeFilter,
  setTimeFilter,
  searchQuery,
  setSearchQuery,
  onOpenNewTaskModal,
  onOpenNewWorkerModal,
  onSyncGoogleSheets,
  isSyncing,
  overdueTasks,
  onCompleteTask,
  onEditTask,
  currentUser,
  onLogout,
}) => {
  const { isDark } = useTheme();
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const getViewDetails = () => {
    switch (currentView) {
      case 'dashboard':
        return {
          title: 'Panel de Rendimiento',
          badge: 'En Vivo',
          icon: LayoutDashboard,
          showTimeFilter: true,
        };
      case 'tasks':
        return {
          title: 'Programación & Tareas',
          badge: 'Cronograma',
          icon: CheckSquare,
          showTimeFilter: true,
        };
      case 'workers':
        return {
          title: 'Perfiles de Equipo',
          badge: 'Face ID',
          icon: Users,
          showTimeFilter: false,
        };
      case 'sheets':
        return {
          title: 'Google Sheets Hub',
          badge: 'Multi-Tab',
          icon: FileSpreadsheet,
          showTimeFilter: false,
        };
      case 'emails':
        return {
          title: 'Despacho de Reportes',
          badge: 'SMTP',
          icon: Mail,
          showTimeFilter: false,
        };
      default:
        return {
          title: 'SyncroWork Pro',
          badge: 'STF Group',
          icon: LayoutDashboard,
          showTimeFilter: true,
        };
    }
  };

  const viewInfo = getViewDetails();
  const ViewIcon = viewInfo.icon;

  return (
    <header className={`backdrop-blur-xl border-b shrink-0 z-20 relative transition-colors duration-300 ${
      isDark ? 'bg-[#0B0F19]/90 border-slate-800/80 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-900 shadow-xs'
    }`}>
      <div className="px-5 py-2.5 flex items-center justify-between gap-3 min-h-[58px]">
        
        {/* ================= 1. LEFT ZONE: VIEW CONTEXT ================= */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
            isDark 
              ? 'bg-slate-900/90 border-slate-800 text-blue-400 shadow-inner' 
              : 'bg-blue-50 border-blue-100 text-blue-600 shadow-xs'
          }`}>
            <ViewIcon className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-2">
            <h2 className={`font-extrabold text-sm sm:text-base tracking-tight leading-none ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {viewInfo.title}
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {viewInfo.badge}
            </span>
          </div>
        </div>

        {/* ================= 2. CENTER ZONE: TIME FILTER & SEARCH ================= */}
        <div className="flex items-center gap-3 flex-1 max-w-2xl justify-center">
          
          {/* Time Filter Segmented Control */}
          {viewInfo.showTimeFilter && (
            <div className={`hidden lg:flex items-center p-1 rounded-xl border text-xs font-medium shrink-0 ${
              isDark ? 'bg-slate-900/90 border-slate-800/90 text-slate-400' : 'bg-slate-100/90 border-slate-200 text-slate-600'
            }`}>
              {(
                [
                  { id: 'day', label: 'Hoy' },
                  { id: 'week', label: 'Semana' },
                  { id: 'month', label: 'Mes' },
                  { id: 'all', label: 'Histórico' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  id={`filter-${f.id}-btn`}
                  onClick={() => setTimeFilter(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs transition-all duration-150 cursor-pointer ${
                    timeFilter === f.id
                      ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/30'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* Spotlight Search Bar */}
          <div className="relative w-full max-w-xs md:max-w-sm">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
              isDark ? 'text-slate-400' : 'text-slate-400'
            }`} />
            <input
              id="header-search-input"
              type="text"
              placeholder="Buscar tareas, colaborador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full h-9 pl-8 pr-12 border rounded-xl text-xs transition-all outline-none focus:ring-2 focus:ring-blue-500/20 ${
                isDark 
                  ? 'bg-slate-900/80 hover:bg-slate-900 focus:bg-slate-900 border-slate-800 focus:border-blue-500 text-slate-100 placeholder-slate-400' 
                  : 'bg-slate-50 hover:bg-slate-100/70 focus:bg-white border-slate-200 focus:border-blue-500 text-slate-900 placeholder-slate-400 shadow-xs'
              }`}
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${
                  isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9.5px] font-mono pointer-events-none border ${
                isDark ? 'bg-slate-800 text-slate-400 border-slate-700/50' : 'bg-slate-200/80 text-slate-500 border-slate-300/60'
              }`}>
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </div>
            )}
          </div>
        </div>

        {/* ================= 3. RIGHT ZONE: UTILITIES & ACTIONS ================= */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Futuristic Theme Switcher (Compact Haute-Tech Mode) */}
          <FuturisticThemeToggle compact={true} />

          {/* Quick Utility: Sync Sheets Button */}
          <button
            id="quick-sync-btn"
            onClick={onSyncGoogleSheets}
            disabled={isSyncing}
            title="Sincronizar base de datos con Google Sheets"
            className={`h-9 px-2.5 sm:px-3 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${
              isDark
                ? 'text-slate-300 bg-slate-900/90 hover:bg-slate-800 hover:text-white border-slate-700/80'
                : 'text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border-slate-200 shadow-xs'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden xl:inline">
              {isSyncing ? 'Sincronizando...' : 'Sync Sheets'}
            </span>
          </button>

          {/* Quick Utility: Deadline Alerts Notification Bell */}
          <div className="relative">
            <button
              id="deadline-alerts-bell-btn"
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              title={
                overdueTasks.length > 0
                  ? `Alerta: ${overdueTasks.length} tareas con tiempo cumplido`
                  : 'Sin alertas pendientes'
              }
              className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all relative cursor-pointer ${
                overdueTasks.length > 0
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/40 hover:bg-rose-500/25 shadow-sm shadow-rose-500/20'
                  : isDark
                  ? 'bg-slate-900/90 text-slate-400 border-slate-700/80 hover:bg-slate-800 hover:text-slate-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-xs'
              }`}
            >
              <Bell className={`w-4 h-4 ${overdueTasks.length > 0 ? 'text-rose-400 animate-bounce' : ''}`} />
              {overdueTasks.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-extrabold text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-md">
                  {overdueTasks.length}
                </span>
              )}
            </button>

            {/* Overdue Tasks Dropdown Popover */}
            {isAlertsOpen && (
              <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 ${
                isDark ? 'bg-slate-900/95 border-slate-700 backdrop-blur-2xl' : 'bg-white border-slate-200 shadow-2xl text-slate-900'
              }`}>
                <div className={`p-3.5 border-b flex items-center justify-between ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-rose-500/20 rounded-lg text-rose-400 border border-rose-500/30">
                      <Clock className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <h4 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>Alertas de Tiempo Cumplido</h4>
                      <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {overdueTasks.length === 1 ? '1 trabajo con plazo vencido' : `${overdueTasks.length} trabajos con plazo vencido`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAlertsOpen(false)}
                    className={`p-1 rounded-lg ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className={`max-h-72 overflow-y-auto p-1 divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                  {overdueTasks.length === 0 ? (
                    <div className="p-5 text-center text-xs">
                      <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto mb-1.5 opacity-80" />
                      <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>¡Cronograma al día!</p>
                      <p className={`text-[10.5px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No hay tareas pendientes con tiempo excedido.</p>
                    </div>
                  ) : (
                    overdueTasks.map((t) => {
                      const elapsed = getOverdueDurationText(t);
                      return (
                        <div key={t.id} className={`p-2.5 transition-colors space-y-1.5 rounded-xl ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                          <div className="flex items-start justify-between gap-2">
                            <p className={`font-bold text-xs leading-snug ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{t.title}</p>
                            <span className="shrink-0 text-[9px] bg-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded-full border border-rose-500/30 font-mono">
                              {elapsed}
                            </span>
                          </div>

                          <div className={`flex items-center justify-between text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t.workerName}</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  onCompleteTask(t.id);
                                }}
                                className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-500 border border-emerald-500/30 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                              >
                                Listo
                              </button>
                              <button
                                onClick={() => {
                                  onEditTask(t);
                                  setIsAlertsOpen(false);
                                }}
                                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer border ${
                                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                }`}
                              >
                                Extender
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={`h-5 w-px mx-0.5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

          {/* Action 1: New Task Button (Primary Glow CTA) */}
          <button
            id="header-new-task-btn"
            onClick={onOpenNewTaskModal}
            className="h-9 flex items-center gap-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Tarea</span>
          </button>

          {/* Action 2: New Worker Button */}
          <button
            id="header-new-worker-btn"
            onClick={onOpenNewWorkerModal}
            className={`h-9 hidden md:flex items-center gap-1.5 border text-xs font-semibold px-3 rounded-xl transition-all cursor-pointer shrink-0 ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-700/80' 
                : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200 shadow-xs'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden lg:inline">Colaborador</span>
          </button>

          {/* User Profile Mini Trigger */}
          {currentUser && (
            <div className="relative ml-0.5">
              <button
                id="header-user-menu-btn"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`h-9 flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-xl border transition-all cursor-pointer ${
                  isDark 
                    ? 'bg-slate-900/90 border-slate-700/80 hover:bg-slate-800 text-white' 
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-900 shadow-xs'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg ${currentUser.avatarColor || 'bg-blue-600 text-white'} flex items-center justify-center font-bold text-[10px] shadow-xs`}>
                  {currentUser.initials}
                </div>
                <span className={`text-xs font-bold hidden xl:inline max-w-24 truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 ${
                  isDark ? 'bg-slate-900/95 border-slate-700 backdrop-blur-2xl text-white' : 'bg-white border-slate-200 shadow-2xl text-slate-900'
                }`}>
                  <div className={`px-3 py-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <p className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentUser.name}</p>
                    <p className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{currentUser.email}</p>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{currentUser.documentId ? `C.C. ${currentUser.documentId}` : 'Super Administrador'}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    {onLogout && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-500 transition-colors cursor-pointer font-medium ${
                          isDark ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50'
                        }`}
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Cerrar Sesión</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
