import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Send, 
  ExternalLink, 
  ChevronRight, 
  TrendingUp, 
  FileSpreadsheet, 
  AlertCircle, 
  Activity, 
  Layers, 
  Zap, 
  Target 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { 
  Task, 
  Worker, 
  TimeFilter, 
  PerformanceStats, 
  EmailAutomationConfig, 
  GoogleSheetsConfig 
} from '../types';
import { 
  WorkerMetricSummary, 
  generateHourlyProductivityData, 
  generateWeeklyProductivityData, 
  generateMonthlyProductivityData 
} from '../utils/calculations';
import { useTheme } from '../context/ThemeContext';

interface DashboardViewProps {
  timeFilter: TimeFilter;
  stats: PerformanceStats;
  workerSummaries: WorkerMetricSummary[];
  recentTasks: Task[];
  emailConfigs: EmailAutomationConfig[];
  sheetsConfig: GoogleSheetsConfig;
  onNavigateToEmails: () => void;
  onNavigateToSheets: () => void;
  onNavigateToWorkers: () => void;
  onNavigateToTasks: () => void;
  onOpenNewTaskModal: () => void;
  onSelectWorker: (worker: Worker) => void;
  onToggleEmailAutomation: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  timeFilter,
  stats,
  workerSummaries,
  recentTasks,
  emailConfigs,
  sheetsConfig,
  onNavigateToEmails,
  onNavigateToSheets,
  onNavigateToWorkers,
  onNavigateToTasks,
  onOpenNewTaskModal,
  onSelectWorker,
  onToggleEmailAutomation,
}) => {
  const { isDark } = useTheme();

  const getTrendData = () => {
    if (timeFilter === 'day') return generateHourlyProductivityData();
    if (timeFilter === 'week') return generateWeeklyProductivityData();
    return generateMonthlyProductivityData();
  };

  const trendData = getTrendData();
  const activeEmailConfig = emailConfigs.find((c) => c.isActive) || emailConfigs[0];

  return (
    <div className={`p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto transition-colors duration-300 ${
      isDark ? 'text-slate-100' : 'text-slate-800'
    }`}>
      
      {/* ========================================================================= */}
      {/* 1. BENTO GRID TOP KPIS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Eficiencia Global */}
        <div 
          id="kpi-efficiency-card" 
          className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 group ${
            isDark 
              ? 'bg-gradient-to-b from-slate-900/90 to-[#0F172A]/90 border-slate-800 shadow-lg hover:border-emerald-500/30' 
              : 'bg-white border-slate-200/90 light-card-shadow hover:border-emerald-500/40'
          }`}
        >
          <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl transition-all ${
            isDark 
              ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20' 
              : 'bg-emerald-500/10 group-hover:bg-emerald-500/15'
          }`} />
          
          <div className="flex items-center justify-between mb-2 relative z-10">
            <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              Eficiencia Global
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
              isDark 
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                : 'text-emerald-700 bg-emerald-50 border-emerald-200'
            }`}>
              <TrendingUp className="w-2.5 h-2.5" /> +4.2%
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2 relative z-10">
            <h3 className={`text-3xl font-extrabold font-mono tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {stats.globalEfficiency}%
            </h3>
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              promedio
            </span>
          </div>

          {/* Progress bar */}
          <div className={`mt-3.5 h-2 w-full rounded-full overflow-hidden p-0.5 relative z-10 ${
            isDark ? 'bg-slate-800' : 'bg-slate-100'
          }`}>
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 shadow-sm shadow-emerald-500/40"
              style={{ width: `${Math.min(100, Math.max(5, stats.globalEfficiency))}%` }}
            />
          </div>

          <p className={`text-[11px] mt-2.5 font-medium flex justify-between items-center relative z-10 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <span>Estimado vs Real</span>
            <span className={`font-semibold font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              Meta: 90%
            </span>
          </p>
        </div>

        {/* KPI 2: Entregas a Tiempo */}
        <div 
          id="kpi-ontime-card" 
          className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 group ${
            isDark 
              ? 'bg-gradient-to-b from-slate-900/90 to-[#0F172A]/90 border-slate-800 shadow-lg hover:border-blue-500/30' 
              : 'bg-white border-slate-200/90 light-card-shadow hover:border-blue-500/40'
          }`}
        >
          <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl transition-all ${
            isDark 
              ? 'bg-blue-500/10 group-hover:bg-blue-500/20' 
              : 'bg-blue-500/10 group-hover:bg-blue-500/15'
          }`} />

          <div className="flex items-center justify-between mb-2 relative z-10">
            <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <Target className="w-3.5 h-3.5 text-blue-500" />
              Entregas a Tiempo
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isDark 
                ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' 
                : 'text-blue-700 bg-blue-50 border-blue-200'
            }`}>
              Puntualidad
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2 relative z-10">
            <h3 className={`text-3xl font-extrabold font-mono tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {stats.onTimeDeliveryRate}%
            </h3>
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ratio
            </span>
          </div>

          <div className={`mt-3.5 h-2 w-full rounded-full overflow-hidden p-0.5 relative z-10 ${
            isDark ? 'bg-slate-800' : 'bg-slate-100'
          }`}>
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700 shadow-sm shadow-blue-500/40"
              style={{ width: `${Math.min(100, Math.max(5, stats.onTimeDeliveryRate))}%` }}
            />
          </div>

          <p className={`text-[11px] mt-2.5 font-medium flex justify-between items-center relative z-10 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <span>{stats.completedTasks} completadas</span>
            <span className={`font-semibold font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              0 retrasos
            </span>
          </p>
        </div>

        {/* KPI 3: Tiempo Promedio de Entrega */}
        <div 
          id="kpi-avgtime-card" 
          className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 group ${
            isDark 
              ? 'bg-gradient-to-b from-slate-900/90 to-[#0F172A]/90 border-slate-800 shadow-lg hover:border-indigo-500/30' 
              : 'bg-white border-slate-200/90 light-card-shadow hover:border-indigo-500/40'
          }`}
        >
          <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl transition-all ${
            isDark 
              ? 'bg-indigo-500/10 group-hover:bg-indigo-500/20' 
              : 'bg-indigo-500/10 group-hover:bg-indigo-500/15'
          }`} />

          <div className="flex items-center justify-between mb-2 relative z-10">
            <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              Tiempo Promedio
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isDark 
                ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' 
                : 'text-indigo-700 bg-indigo-50 border-indigo-200'
            }`}>
              Por Trabajo
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2 relative z-10">
            <h3 className={`text-3xl font-extrabold font-mono tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {stats.avgCompletionHours}
              <span className={`text-xl font-normal ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                hrs
              </span>
            </h3>
          </div>

          <div className="mt-3.5 flex items-center text-xs relative z-10">
            {stats.hoursVariance >= 0 ? (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg w-full border ${
                isDark 
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                  : 'text-emerald-700 bg-emerald-50 border-emerald-200'
              }`}>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                <span className="font-semibold">{stats.hoursVariance}h ahorradas vs estimación</span>
              </div>
            ) : (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg w-full border ${
                isDark 
                  ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' 
                  : 'text-rose-700 bg-rose-50 border-rose-200'
              }`}>
                <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
                <span className="font-semibold">{Math.abs(stats.hoursVariance)}h sobre el estimado</span>
              </div>
            )}
          </div>

          <p className={`text-[11px] mt-2 font-medium relative z-10 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            Velocidad promedio de despacho
          </p>
        </div>

        {/* KPI 4: Carga y Avance de Trabajos */}
        <div 
          id="kpi-tasks-card" 
          className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 group ${
            isDark 
              ? 'bg-gradient-to-b from-slate-900/90 to-[#0F172A]/90 border-slate-800 shadow-lg hover:border-cyan-500/30' 
              : 'bg-white border-slate-200/90 light-card-shadow hover:border-cyan-500/40'
          }`}
        >
          <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl transition-all ${
            isDark 
              ? 'bg-cyan-500/10 group-hover:bg-cyan-500/20' 
              : 'bg-cyan-500/10 group-hover:bg-cyan-500/15'
          }`} />

          <div className="flex items-center justify-between mb-2 relative z-10">
            <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <Layers className="w-3.5 h-3.5 text-cyan-500" />
              Carga Operativa
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isDark 
                ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' 
                : 'text-cyan-700 bg-cyan-50 border-cyan-200'
            }`}>
              {stats.inProgressTasks} activas
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2 relative z-10">
            <h3 className={`text-3xl font-extrabold font-mono tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {stats.completedTasks}
              <span className={`text-lg font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                /{stats.totalTasks}
              </span>
            </h3>
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              finalizadas
            </span>
          </div>

          {/* Mini Status Breakdown */}
          <div className="mt-3.5 grid grid-cols-3 gap-1 text-[10px] font-mono text-center relative z-10">
            <div className={`p-1 rounded-lg border transition-colors ${
              isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-50 border-slate-200/80 shadow-2xs'
            }`}>
              <p className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{stats.completedTasks}</p>
              <p className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Listas</p>
            </div>
            <div className={`p-1 rounded-lg border transition-colors ${
              isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-50 border-slate-200/80 shadow-2xs'
            }`}>
              <p className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{stats.inProgressTasks}</p>
              <p className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>En curso</p>
            </div>
            <div className={`p-1 rounded-lg border transition-colors ${
              isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-50 border-slate-200/80 shadow-2xs'
            }`}>
              <p className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{stats.pendingTasks}</p>
              <p className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pendientes</p>
            </div>
          </div>

          <p className={`text-[11px] mt-2 font-medium text-right relative z-10 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% avance
          </p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN SECTION: WORKER PERFORMANCE MATRIX & AUTOMATION HUB */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Worker Performance Matrix (8 cols) */}
        <div className={`lg:col-span-8 rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 ${
          isDark 
            ? 'bg-slate-900/80 border-slate-800 shadow-xl' 
            : 'bg-white border-slate-200/90 light-card-shadow'
        }`}>
          <div className={`p-5 border-b flex flex-wrap justify-between items-center gap-3 ${
            isDark ? 'border-slate-800' : 'border-slate-200/80'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <h4 className={`font-bold text-sm flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  <Activity className="w-4 h-4 text-blue-500" />
                  Matriz de Desempeño por Colaborador
                </h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  isDark 
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  STF Group Team
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Seguimiento individual de tiempos estimados, horas efectivas y porcentaje de eficiencia
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToWorkers}
                className={`text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer border ${
                  isDark 
                    ? 'text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20' 
                    : 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 border-blue-200/80'
                }`}
              >
                <span>Ver todos los perfiles</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className={`text-[10px] uppercase font-bold tracking-wider border-b ${
                isDark 
                  ? 'bg-slate-950/60 text-slate-400 border-slate-800' 
                  : 'bg-slate-50/90 text-slate-500 border-slate-200/80'
              }`}>
                <tr>
                  <th className="px-5 py-3">Colaborador</th>
                  <th className="px-5 py-3">Tarea Activa</th>
                  <th className="px-5 py-3 text-center">Estimado</th>
                  <th className="px-5 py-3 text-center">Real</th>
                  <th className="px-5 py-3 text-center">Puntualidad</th>
                  <th className="px-5 py-3 text-right">Eficiencia</th>
                </tr>
              </thead>
              <tbody className={`text-xs divide-y ${
                isDark ? 'divide-slate-800/60' : 'divide-slate-100'
              }`}>
                {workerSummaries.slice(0, 5).map((summary, index) => {
                  const w = summary.worker;
                  const isPositive = summary.avgEfficiency >= 0;
                  return (
                    <tr 
                      key={w.id} 
                      onClick={() => onSelectWorker(w)}
                      className={`cursor-pointer transition-colors group ${
                        isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/90'
                      }`}
                    >
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <div className="relative">
                          {w.avatarUrl ? (
                            <img 
                              src={w.avatarUrl} 
                              alt={w.name} 
                              className={`w-8 h-8 rounded-xl object-cover border shadow-sm ${
                                isDark ? 'border-slate-700' : 'border-slate-200'
                              }`}
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-xl ${w.avatarColor} border flex items-center justify-center font-bold text-xs shadow-sm ${
                              isDark ? 'border-slate-700' : 'border-slate-200'
                            }`}>
                              {w.initials}
                            </div>
                          )}
                          <span className={`absolute -top-1 -left-1 w-4 h-4 rounded-full border text-[9px] font-mono flex items-center justify-center ${
                            isDark 
                              ? 'bg-slate-950 border-slate-700 text-slate-400' 
                              : 'bg-white border-slate-200 text-slate-600 shadow-xs'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <span className={`font-bold block transition-colors ${
                            isDark 
                              ? 'text-slate-100 group-hover:text-blue-400' 
                              : 'text-slate-900 group-hover:text-blue-600'
                          }`}>
                            {w.name}
                          </span>
                          <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {w.role}
                          </span>
                        </div>
                      </td>

                      <td className={`px-5 py-3.5 max-w-xs truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {summary.currentTaskTitle ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 animate-pulse"></span>
                            <span className={`font-medium truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                              {summary.currentTaskTitle}
                            </span>
                          </div>
                        ) : (
                          <span className={`italic ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                            Tareas al día
                          </span>
                        )}
                        <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {summary.completed} de {summary.totalAssigned} finalizadas
                        </p>
                      </td>

                      <td className={`px-5 py-3.5 text-center font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {summary.totalEstimatedHours > 0 ? `${summary.totalEstimatedHours}h` : '—'}
                      </td>

                      <td className={`px-5 py-3.5 text-center font-bold font-mono ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                        {summary.totalActualHours > 0 ? `${summary.totalActualHours}h` : '—'}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span className={`text-[11px] font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                          {summary.onTimeRate}%
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <span
                          className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold inline-flex items-center gap-1 border ${
                            isPositive
                              ? isDark 
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isDark 
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' 
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {isPositive ? `+${summary.avgEfficiency}%` : `${summary.avgEfficiency}%`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reports & Google Sheets Automation Widget (4 cols) */}
        <div className={`lg:col-span-4 p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all duration-300 ${
          isDark 
            ? 'bg-slate-900/80 border-slate-800 shadow-xl' 
            : 'bg-white border-slate-200/90 light-card-shadow'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`font-bold text-sm flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                <Send className="w-4 h-4 text-blue-500" />
                Automatizaciones Activas
              </h4>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                isDark 
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                En Cola
              </span>
            </div>

            <div className="space-y-3">
              {/* Scheduled Email Card */}
              {activeEmailConfig && (
                <div className={`p-3.5 rounded-xl border transition-colors ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/90 border-slate-200/80 shadow-2xs'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-xs font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {activeEmailConfig.name}
                    </p>
                    <button
                      onClick={() => onToggleEmailAutomation(activeEmailConfig.id)}
                      className={`w-8 h-4.5 rounded-full relative transition-colors cursor-pointer ${
                        activeEmailConfig.isActive ? 'bg-blue-600' : isDark ? 'bg-slate-800' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${
                          activeEmailConfig.isActive ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className={`text-[11px] space-y-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <p>
                      <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Frecuencia:</span>{' '}
                      {activeEmailConfig.frequency === 'daily'
                        ? 'Diaria'
                        : activeEmailConfig.frequency === 'weekly'
                        ? 'Semanal (Viernes)'
                        : 'Mensual'}{' '}
                      a las {activeEmailConfig.timeOfDay} hrs
                    </p>
                    <p className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Destinatarios: {activeEmailConfig.recipients.join(', ')}
                    </p>
                  </div>

                  <div className={`flex items-center justify-between text-[10px] pt-2 mt-2 border-t ${
                    isDark ? 'border-slate-800' : 'border-slate-200/80'
                  }`}>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Estado de despacho:</span>
                    <span className={`font-bold font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {activeEmailConfig.isActive ? 'Activo (Automático)' : 'Pausado'}
                    </span>
                  </div>
                </div>
              )}

              {/* Sheet Mapping Card */}
              <div className={`p-3.5 rounded-xl border transition-colors ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/90 border-slate-200/80 shadow-2xs'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-xs font-bold flex items-center gap-1.5 ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  }`}>
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    Mapeo Google Sheets
                  </p>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isDark 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  }`}>
                    5 Pestañas
                  </span>
                </div>

                <div className="space-y-1.5 text-[10px] font-mono">
                  <div className={`flex items-center justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span className="flex items-center gap-1.5">📊 Resumen_Productividad</span>
                    <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>ONLINE</span>
                  </div>
                  <div className={`flex items-center justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span className="flex items-center gap-1.5">📋 Tareas_Programadas</span>
                    <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>ONLINE</span>
                  </div>
                  <div className={`flex items-center justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span className="flex items-center gap-1.5">👥 Perfiles_Trabajadores</span>
                    <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>ONLINE</span>
                  </div>
                  <div className={`flex items-center justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span className="flex items-center gap-1.5">⏱️ Registro_Tiempos</span>
                    <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>ONLINE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onNavigateToEmails}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700/80' 
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border-slate-200'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-blue-500" />
              <span>Configurar Envíos y Plantillas</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PRODUCTIVITY TREND CHART (PERFORMANCE VS TIME) */}
      {/* ========================================================================= */}
      <div className={`rounded-2xl border p-6 transition-all duration-300 ${
        isDark 
          ? 'bg-slate-900/80 border-slate-800 shadow-xl' 
          : 'bg-white border-slate-200/90 light-card-shadow'
      }`}>
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <div>
            <h4 className={`font-bold text-sm flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Curva de Tendencia de Productividad & Cumplimiento
            </h4>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Comparativa horaria y por período entre el rendimiento real (%) y la meta estipulada
            </p>
          </div>

          <div className={`flex items-center space-x-4 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-sm shadow-xs shadow-blue-500/50"></span>
              <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>Rendimiento Real (%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-sm ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></span>
              <span>Meta Estipulada (%)</span>
            </div>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-68 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trendData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke={isDark ? '#1E293B' : '#E2E8F0'} 
              />
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }}
                domain={[0, 100]}
              />
              <Tooltip 
                cursor={{ fill: isDark ? 'rgba(51, 65, 85, 0.2)' : 'rgba(226, 232, 240, 0.5)' }}
                contentStyle={{ 
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF', 
                  borderColor: isDark ? '#334155' : '#E2E8F0', 
                  borderRadius: '12px', 
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  fontSize: '12px',
                  boxShadow: isDark 
                    ? '0 10px 25px -5px rgba(0,0,0,0.5)' 
                    : '0 10px 25px -5px rgba(15,28,68,0.12)'
                }}
              />
              <Bar 
                dataKey="target" 
                name="Meta (%)" 
                fill={isDark ? '#334155' : '#CBD5E1'} 
                radius={[6, 6, 0, 0]} 
                maxBarSize={32} 
              />
              <Bar 
                dataKey="real" 
                name="Rendimiento Real (%)" 
                fill="#3B82F6" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={32} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
