import React, { useState, useMemo } from 'react';
import { 
  UserPlus, 
  Mail, 
  Phone, 
  Calendar, 
  Award, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  Layers, 
  Sparkles, 
  Plus, 
  Check, 
  Activity, 
  UserCheck,
  ShieldCheck,
  LayoutGrid
} from 'lucide-react';
import { Worker, Task, TaskStatus } from '../types';
import { 
  WorkerMetricSummary, 
  calculateWorkerPeriodPerformance, 
  WorkerPeriodPerformance 
} from '../utils/calculations';
import { isTaskDeadlineReached, getOverdueDurationText } from '../utils/deadlineAlert';

interface WorkersViewProps {
  workers: Worker[];
  workerSummaries: WorkerMetricSummary[];
  tasks: Task[];
  onOpenNewWorkerModal: () => void;
  onEditWorker: (worker: Worker) => void;
  onDeleteWorker: (workerId: string) => void;
  onSelectWorker: (worker: Worker) => void;
  onOpenNewTaskModalForWorker?: (workerId: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: TaskStatus) => void;
}

export const WorkersView: React.FC<WorkersViewProps> = ({
  workers,
  workerSummaries,
  tasks,
  onOpenNewWorkerModal,
  onEditWorker,
  onDeleteWorker,
  onSelectWorker,
  onOpenNewTaskModalForWorker,
  onEditTask,
  onDeleteTask,
  onUpdateTaskStatus,
}) => {
  const [viewMode, setViewMode] = useState<'tabs' | 'grid'>('tabs');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(
    workers[0]?.id || ''
  );
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'all' | 'en_progreso' | 'completado' | 'retrasado'>('all');

  const activeWorker = useMemo(() => {
    return workers.find((w) => w.id === selectedWorkerId) || workers[0] || null;
  }, [workers, selectedWorkerId]);

  const activeWorkerPerformance: WorkerPeriodPerformance | null = useMemo(() => {
    if (!activeWorker) return null;
    return calculateWorkerPeriodPerformance(activeWorker.id, tasks);
  }, [activeWorker, tasks]);

  const activeWorkerTasks = useMemo(() => {
    if (!activeWorker) return [];
    let list = tasks.filter((t) => t.workerId === activeWorker.id);
    if (taskStatusFilter !== 'all') {
      list = list.filter((t) => t.status === taskStatusFilter);
    }
    return list;
  }, [activeWorker, tasks, taskStatusFilter]);

  const departments = Array.from(new Set(workers.map((w) => w.department)));

  const filteredSummaries = workerSummaries.filter((ws) => {
    if (selectedDept !== 'all' && ws.worker.department !== selectedDept) {
      return false;
    }
    return true;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto text-slate-100">
      
      {/* ========================================================================= */}
      {/* TOP TOOLBAR: VIEW MODES & ACTIONS */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/85 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setViewMode('tabs')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'tabs'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Pestañas Individuales ({workers.length})</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cuadrícula del Equipo</span>
            </button>
          </div>
        </div>

        <button
          id="add-worker-main-btn"
          onClick={onOpenNewWorkerModal}
          className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-blue-600/25 transition-all cursor-pointer active:scale-98"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Registrar Nuevo Colaborador</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: PESTAÑAS INDIVIDUALES (PERFILES & MATRIZ HORARIA) */}
      {/* ========================================================================= */}
      {viewMode === 'tabs' && (
        <div className="space-y-6">
          
          {/* Worker Tabs Strip */}
          <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 shadow-lg flex items-center gap-2.5 overflow-x-auto">
            {workers.map((w) => {
              const isSelected = w.id === activeWorker?.id;
              const wTasks = tasks.filter((t) => t.workerId === w.id);
              const overdueCount = wTasks.filter((t) => isTaskDeadlineReached(t)).length;
              const perf = calculateWorkerPeriodPerformance(w.id, tasks);

              return (
                <button
                  key={w.id}
                  onClick={() => setSelectedWorkerId(w.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all shrink-0 border cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-md shadow-blue-600/10'
                      : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="relative">
                    {w.avatarUrl ? (
                      <img src={w.avatarUrl} alt={w.name} className="w-8 h-8 rounded-xl object-cover border border-slate-700 shadow-xs shrink-0" />
                    ) : (
                      <div className={`w-8 h-8 rounded-xl ${w.avatarColor} border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                        {w.initials}
                      </div>
                    )}
                    {overdueCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    )}
                  </div>

                  <div className="text-left">
                    <div className="font-bold text-slate-100 flex items-center gap-1.5 leading-tight">
                      <span>{w.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                      <span>{w.department.split(' ')[0]}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-bold">{perf.globalEfficiency}% ef.</span>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {wTasks.length}
                  </span>
                </button>
              );
            })}
          </div>

          {activeWorker && activeWorkerPerformance && (
            <div className="space-y-6">
              
              {/* Active Worker Profile Header Card */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-wrap items-center justify-between gap-6 relative">
                  <div className="flex items-center space-x-5">
                    <div className="relative">
                      {activeWorker.avatarUrl ? (
                        <img 
                          src={activeWorker.avatarUrl} 
                          alt={activeWorker.name} 
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-2xl border-2 border-slate-700 text-lg flex items-center justify-center font-bold shadow-md ${activeWorker.avatarColor}`}>
                          {activeWorker.initials}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-[#090D16]">
                        <ShieldCheck className="w-3 h-3 text-white" />
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-xl font-extrabold text-white tracking-tight">{activeWorker.name}</h2>
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          {activeWorker.status.toUpperCase()}
                        </span>
                        <span className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                          Face ID Enrolled
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 font-medium px-2.5 py-0.5 rounded-full border border-slate-700">
                          {activeWorker.department}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 font-medium mt-1">{activeWorker.role}</p>

                      <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400 mt-2.5">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-blue-400" /> {activeWorker.email}
                        </span>
                        {activeWorker.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-blue-400" /> {activeWorker.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" /> Ingreso: {activeWorker.joinDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5">
                    {onOpenNewTaskModalForWorker && (
                      <button
                        onClick={() => onOpenNewTaskModalForWorker(activeWorker.id)}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-blue-600/25 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Asignar Tarea a {activeWorker.name.split(' ')[0]}</span>
                      </button>
                    )}
                    <button
                      onClick={() => onEditWorker(activeWorker)}
                      className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer"
                      title="Editar perfil"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      id={`tab-delete-worker-${activeWorker.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteWorker(activeWorker.id);
                      }}
                      className="p-2 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-colors cursor-pointer"
                      title="Eliminar colaborador"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 PERFORMANCE HORIZON BENTO CARDS (DÍA, SEMANA, MES) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. DÍA */}
                <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 relative overflow-hidden shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                          Rendimiento Día
                        </span>
                        <span className="text-[10px] text-slate-400">Jornada Actual</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold px-2 py-0.5 rounded-full font-mono">
                      Hoy
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white font-mono">
                        {activeWorkerPerformance.dayEfficiency}%
                      </span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center">
                        <ArrowUpRight className="w-3.5 h-3.5" /> En meta
                      </span>
                    </div>
                    <div className="text-right text-[11px] text-slate-400 font-mono">
                      <span className="font-bold text-white">{activeWorkerPerformance.dayTasksCompleted}</span>/{activeWorkerPerformance.dayTasksTotal} tareas
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Horas Est. vs Real:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {activeWorkerPerformance.dayHoursEstimated}h / {activeWorkerPerformance.dayHoursActual > 0 ? `${activeWorkerPerformance.dayHoursActual}h` : 'En curso'}
                    </span>
                  </div>
                </div>

                {/* 2. SEMANA */}
                <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 relative overflow-hidden shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                          Rendimiento Semana
                        </span>
                        <span className="text-[10px] text-slate-400">Últimos 7 días</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full font-mono">
                      Semanal
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white font-mono">
                        {activeWorkerPerformance.weekEfficiency}%
                      </span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center">
                        <ArrowUpRight className="w-3.5 h-3.5" /> +5.1%
                      </span>
                    </div>
                    <div className="text-right text-[11px] text-slate-400 font-mono">
                      <span className="font-bold text-white">{activeWorkerPerformance.weekTasksCompleted}</span>/{activeWorkerPerformance.weekTasksTotal} tareas
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Horas Est. vs Real:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {activeWorkerPerformance.weekHoursEstimated}h / {activeWorkerPerformance.weekHoursActual > 0 ? `${activeWorkerPerformance.weekHoursActual}h` : 'En curso'}
                    </span>
                  </div>
                </div>

                {/* 3. MES */}
                <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 relative overflow-hidden shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                          Rendimiento Mes
                        </span>
                        <span className="text-[10px] text-slate-400">Mes Calendario</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-bold px-2 py-0.5 rounded-full font-mono">
                      Mensual
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white font-mono">
                        {activeWorkerPerformance.monthEfficiency}%
                      </span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center">
                        <ArrowUpRight className="w-3.5 h-3.5" /> Sobresaliente
                      </span>
                    </div>
                    <div className="text-right text-[11px] text-slate-400 font-mono">
                      <span className="font-bold text-white">{activeWorkerPerformance.monthTasksCompleted}</span>/{activeWorkerPerformance.monthTasksTotal} tareas
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Horas Est. vs Real:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {activeWorkerPerformance.monthHoursEstimated}h / {activeWorkerPerformance.monthHoursActual > 0 ? `${activeWorkerPerformance.monthHoursActual}h` : 'En curso'}
                    </span>
                  </div>
                </div>

              </div>

              {/* ACTIVE WORKER TASKS TABLE */}
              <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-400" />
                      Historial de Asignaciones de {activeWorker.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activeWorkerTasks.length} tareas registradas para este colaborador
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={taskStatusFilter}
                      onChange={(e) => setTaskStatusFilter(e.target.value as any)}
                      className="bg-slate-950/80 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-1.5 outline-none cursor-pointer"
                    >
                      <option value="all">Todas las tareas</option>
                      <option value="en_progreso">En Progreso</option>
                      <option value="completado">Completadas</option>
                      <option value="retrasado">Retrasadas</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-950/80 text-[10px] uppercase text-slate-400 font-bold tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-5 py-3">Tarea</th>
                        <th className="px-4 py-3">Categoría</th>
                        <th className="px-4 py-3">Prioridad</th>
                        <th className="px-4 py-3">Fecha Estimada</th>
                        <th className="px-4 py-3 text-center">Horas Est. vs Real</th>
                        <th className="px-4 py-3 text-center">Eficiencia</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-5 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-slate-800/60">
                      {activeWorkerTasks.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                            No hay tareas registradas con este filtro.
                          </td>
                        </tr>
                      ) : (
                        activeWorkerTasks.map((task) => {
                          const isPositive = task.efficiencyPercentage >= 0;
                          return (
                            <tr key={task.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="px-5 py-3.5 font-bold text-slate-200">
                                {task.title}
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                                  {task.category}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="text-[10px] font-bold uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                  {task.priority}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-slate-300 font-mono text-[11px]">
                                {task.estimatedDeliveryDate}
                              </td>
                              <td className="px-4 py-3.5 text-center font-mono text-slate-300">
                                {task.estimatedHours}h / {task.actualHours > 0 ? `${task.actualHours}h` : '—'}
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                <span className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border ${
                                  isPositive 
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                }`}>
                                  {isPositive ? `+${task.efficiencyPercentage}%` : `${task.efficiencyPercentage}%`}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-full">
                                  {task.status}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-right space-x-1.5">
                                {onEditTask && (
                                  <button
                                    onClick={() => onEditTask(task)}
                                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer inline-block"
                                    title="Editar"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {onDeleteTask && (
                                  <button
                                    onClick={() => onDeleteTask(task.id)}
                                    className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer inline-block"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CUADRÍCULA DE EQUIPO (GRID CARDS) */}
      {/* ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="space-y-6">
          {/* Department Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedDept('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedDept === 'all'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Todos ({workers.length})
            </button>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedDept === dept
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSummaries.map((summary) => {
              const w = summary.worker;
              const isPositive = summary.avgEfficiency >= 0;

              return (
                <div
                  key={w.id}
                  onClick={() => onSelectWorker(w)}
                  className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-lg hover:border-blue-500/40 hover:translate-y-[-2px] transition-all cursor-pointer space-y-4 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {w.avatarUrl ? (
                          <img src={w.avatarUrl} alt={w.name} className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-sm" />
                        ) : (
                          <div className={`w-12 h-12 rounded-xl ${w.avatarColor} border border-slate-700 flex items-center justify-center font-bold text-sm shadow-sm`}>
                            {w.initials}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-[#090D16]">
                          <ShieldCheck className="w-2.5 h-2.5 text-white" />
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100 group-hover:text-blue-400 transition-colors">
                          {w.name}
                        </h4>
                        <p className="text-[11px] text-slate-400">{w.role}</p>
                        <span className="inline-block text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 mt-1">
                          {w.department}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border ${
                      isPositive
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}>
                      {summary.avgEfficiency}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center text-xs font-mono">
                    <div>
                      <p className="text-slate-400 text-[9px]">Completadas</p>
                      <p className="font-bold text-slate-200">{summary.completed}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[9px]">Horas Tot.</p>
                      <p className="font-bold text-slate-200">{summary.totalActualHours}h</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[9px]">Puntualidad</p>
                      <p className="font-bold text-emerald-400">{summary.onTimeRate}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="truncate max-w-44">
                      {summary.currentTaskTitle || 'Sin tarea activa'}
                    </span>
                    <span className="text-blue-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Ficha <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
