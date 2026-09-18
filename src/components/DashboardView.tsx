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
  CartesianGrid, 
  Legend 
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
  const getTrendData = () => {
    if (timeFilter === 'day') return generateHourlyProductivityData();
    if (timeFilter === 'week') return generateWeeklyProductivityData();
    return generateMonthlyProductivityData();
  };

  const trendData = getTrendData();
  const activeEmailConfig = emailConfigs.find((c) => c.isActive) || emailConfigs[0];

  return (
    <div className="p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto text-slate-100">
      
      {/* ========================================================================= */}
      {/* 1. BENTO GRID TOP KPIS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Eficiencia Global */}
        <div 
          id="kpi-efficiency-card" 
          className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0F172A]/90 p-5 border border-slate-800 shadow-lg hover:border-emerald-500/30 transition-all duration-300 group"
        >
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Eficiencia Global
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5" /> +4.2%
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {stats.globalEfficiency}%
            </h3>
            <span className="text-xs text-slate-400 font-medium">promedio</span>
          </div>

          {/* Progress bar */}
          <div className="mt-3.5 h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 shadow-sm shadow-emerald-500/40"
              style={{ width: `${Math.min(100, Math.max(5, stats.globalEfficiency))}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 mt-2.5 font-medium flex justify-between items-center">
            <span>Estimado vs Real</span>
            <span className="text-emerald-400 font-semibold font-mono">Meta: 90%</span>
          </p>
        </div>

        {/* KPI 2: Entregas a Tiempo */}
        <div 
          id="kpi-ontime-card" 
          className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0F172A]/90 p-5 border border-slate-800 shadow-lg hover:border-blue-500/30 transition-all duration-300 group"
        >
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />

          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              Entregas a Tiempo
            </span>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
              Puntualidad
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {stats.onTimeDeliveryRate}%
            </h3>
            <span className="text-xs text-slate-400 font-medium">ratio</span>
          </div>

          <div className="mt-3.5 h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700 shadow-sm shadow-blue-500/40"
              style={{ width: `${Math.min(100, Math.max(5, stats.onTimeDeliveryRate))}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 mt-2.5 font-medium flex justify-between items-center">
            <span>{stats.completedTasks} completadas</span>
            <span className="text-blue-400 font-semibold font-mono">0 retrasos</span>
          </p>
        </div>

        {/* KPI 3: Tiempo Promedio de Entrega */}
        <div 
          id="kpi-avgtime-card" 
          className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0F172A]/90 p-5 border border-slate-800 shadow-lg hover:border-indigo-500/30 transition-all duration-300 group"
        >
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />

          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Tiempo Promedio
            </span>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              Por Trabajo
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {stats.avgCompletionHours}
              <span className="text-xl font-normal text-slate-400 ml-1">hrs</span>
            </h3>
          </div>

          <div className="mt-3.5 flex items-center text-xs">
            {stats.hoursVariance >= 0 ? (
              <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg w-full">
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                <span className="font-semibold">{stats.hoursVariance}h ahorradas vs estimación</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg w-full">
                <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
                <span className="font-semibold">{Math.abs(stats.hoursVariance)}h sobre el estimado</span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            Velocidad promedio de despacho
          </p>
        </div>

        {/* KPI 4: Carga y Avance de Trabajos */}
        <div 
          id="kpi-tasks-card" 
          className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-[#0F172A]/90 p-5 border border-slate-800 shadow-lg hover:border-cyan-500/30 transition-all duration-300 group"
        >
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />

          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Carga Operativa
            </span>
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
              {stats.inProgressTasks} activas
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {stats.completedTasks}
              <span className="text-lg font-normal text-slate-400">/{stats.totalTasks}</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">finalizadas</span>
          </div>

          {/* Mini Status Breakdown */}
          <div className="mt-3.5 grid grid-cols-3 gap-1 text-[10px] font-mono text-center">
            <div className="bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
              <p className="text-emerald-400 font-bold">{stats.completedTasks}</p>
              <p className="text-slate-400 text-[9px]">Listas</p>
            </div>
            <div className="bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
              <p className="text-blue-400 font-bold">{stats.inProgressTasks}</p>
              <p className="text-slate-400 text-[9px]">En curso</p>
            </div>
            <div className="bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
              <p className="text-slate-300 font-bold">{stats.pendingTasks}</p>
              <p className="text-slate-400 text-[9px]">Pendientes</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 font-medium text-right">
            {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% avance
          </p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN SECTION: WORKER PERFORMANCE MATRIX & AUTOMATION HUB */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Worker Performance Matrix (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-800 flex flex-wrap justify-between items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Matriz de Desempeño por Colaborador
                </h4>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-semibold">
                  STF Group Team
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Seguimiento individual de tiempos estimados, horas efectivas y porcentaje de eficiencia
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToWorkers}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                <span>Ver todos los perfiles</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950/60 text-[10px] uppercase text-slate-400 font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Colaborador</th>
                  <th className="px-5 py-3">Tarea Activa</th>
                  <th className="px-5 py-3 text-center">Estimado</th>
                  <th className="px-5 py-3 text-center">Real</th>
                  <th className="px-5 py-3 text-center">Puntualidad</th>
                  <th className="px-5 py-3 text-right">Eficiencia</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-800/60">
                {workerSummaries.slice(0, 5).map((summary, index) => {
                  const w = summary.worker;
                  const isPositive = summary.avgEfficiency >= 0;
                  return (
                    <tr 
                      key={w.id} 
                      onClick={() => onSelectWorker(w)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-3.5 flex items-center gap-3">
                        <div className="relative">
                          {w.avatarUrl ? (
                            <img 
                              src={w.avatarUrl} 
                              alt={w.name} 
                              className="w-8 h-8 rounded-xl object-cover border border-slate-700 shadow-sm"
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-xl ${w.avatarColor} border border-slate-700 flex items-center justify-center font-bold text-xs shadow-sm`}>
                              {w.initials}
                            </div>
                          )}
                          <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-slate-950 border border-slate-700 text-[9px] font-mono text-slate-400 flex items-center justify-center">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-100 block group-hover:text-blue-400 transition-colors">
                            {w.name}
                          </span>
                          <span className="text-[10px] text-slate-400">{w.role}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-slate-300 max-w-xs truncate">
                        {summary.currentTaskTitle ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 animate-pulse"></span>
                            <span className="font-medium text-slate-200 truncate">{summary.currentTaskTitle}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Tareas al día</span>
                        )}
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {summary.completed} de {summary.totalAssigned} finalizadas
                        </p>
                      </td>

                      <td className="px-5 py-3.5 text-center text-slate-400 font-mono">
                        {summary.totalEstimatedHours > 0 ? `${summary.totalEstimatedHours}h` : '—'}
                      </td>

                      <td className="px-5 py-3.5 text-center font-bold text-slate-200 font-mono">
                        {summary.totalActualHours > 0 ? `${summary.totalActualHours}h` : '—'}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span className="text-[11px] font-mono font-bold text-slate-300">
                          {summary.onTimeRate}%
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <span
                          className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold inline-flex items-center gap-1 border ${
                            isPositive
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
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
        <div className="lg:col-span-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-400" />
                Automatizaciones Activas
              </h4>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-bold px-2 py-0.5 rounded-full">
                En Cola
              </span>
            </div>

            <div className="space-y-3">
              {/* Scheduled Email Card */}
              {activeEmailConfig && (
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-100">{activeEmailConfig.name}</p>
                    <button
                      onClick={() => onToggleEmailAutomation(activeEmailConfig.id)}
                      className={`w-8 h-4.5 rounded-full relative transition-colors cursor-pointer ${
                        activeEmailConfig.isActive ? 'bg-blue-600' : 'bg-slate-800'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${
                          activeEmailConfig.isActive ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <p>
                      <span className="text-slate-300 font-medium">Frecuencia:</span>{' '}
                      {activeEmailConfig.frequency === 'daily'
                        ? 'Diaria'
                        : activeEmailConfig.frequency === 'weekly'
                        ? 'Semanal (Viernes)'
                        : 'Mensual'}{' '}
                      a las {activeEmailConfig.timeOfDay} hrs
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      Destinatarios: {activeEmailConfig.recipients.join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-2 mt-2 border-t border-slate-800">
                    <span className="text-slate-400">Estado de despacho:</span>
                    <span className="font-bold text-blue-400 font-mono">
                      {activeEmailConfig.isActive ? 'Activo (Automático)' : 'Pausado'}
                    </span>
                  </div>
                </div>
              )}

              {/* Sheet Mapping Card */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    Mapeo Google Sheets
                  </p>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold px-2 py-0.5 rounded-full">
                    5 Pestañas
                  </span>
                </div>

                <div className="space-y-1.5 text-[10px] font-mono">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">📊 Resumen_Productividad</span>
                    <span className="text-emerald-400 font-bold">ONLINE</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">📋 Tareas_Programadas</span>
                    <span className="text-emerald-400 font-bold">ONLINE</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">👥 Perfiles_Trabajadores</span>
                    <span className="text-emerald-400 font-bold">ONLINE</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">⏱️ Registro_Tiempos</span>
                    <span className="text-emerald-400 font-bold">ONLINE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onNavigateToEmails}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700/80"
            >
              <Send className="w-3.5 h-3.5 text-blue-400" />
              <span>Configurar Envíos y Plantillas</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PRODUCTIVITY TREND CHART (PERFORMANCE VS TIME) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl p-6">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <div>
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Curva de Tendencia de Productividad & Cumplimiento
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparativa horaria y por período entre el rendimiento real (%) y la meta estipulada
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-sm shadow-xs shadow-blue-500/50"></span>
              <span className="text-slate-200">Rendimiento Real (%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-slate-700 rounded-sm"></span>
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                domain={[0, 100]}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(51, 65, 85, 0.2)' }}
                contentStyle={{ 
                  backgroundColor: '#0F172A', 
                  borderColor: '#334155', 
                  borderRadius: '12px', 
                  color: '#F8FAFC',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
                }}
              />
              <Bar dataKey="target" name="Meta (%)" fill="#334155" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey="real" name="Rendimiento Real (%)" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
