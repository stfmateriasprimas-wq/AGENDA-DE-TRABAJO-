import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Hourglass, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  ArrowDownRight,
  User,
  Tag,
  Check,
  Play,
  BellRing,
  LayoutGrid,
  List
} from 'lucide-react';
import { Task, Worker, TaskStatus, TaskPriority, TimeFilter } from '../types';
import { isTaskDeadlineReached, getOverdueDurationText } from '../utils/deadlineAlert';

interface TasksViewProps {
  tasks: Task[];
  workers: Worker[];
  timeFilter: TimeFilter;
  onOpenNewTaskModal: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  workers,
  timeFilter,
  onOpenNewTaskModal,
  onEditTask,
  onDeleteTask,
  onUpdateTaskStatus,
}) => {
  const [selectedWorkerFilter, setSelectedWorkerFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [localSearch, setLocalSearch] = useState('');

  // Filter tasks based on filters
  const filteredTasks = tasks.filter((task) => {
    if (selectedWorkerFilter !== 'all' && task.workerId !== selectedWorkerFilter) {
      return false;
    }
    if (selectedStatusFilter === 'overdue') {
      if (!isTaskDeadlineReached(task)) return false;
    } else if (selectedStatusFilter !== 'all' && task.status !== selectedStatusFilter) {
      return false;
    }
    if (localSearch) {
      const q = localSearch.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchWorker = task.workerName.toLowerCase().includes(q);
      const matchCategory = task.category.toLowerCase().includes(q);
      if (!matchTitle && !matchWorker && !matchCategory) return false;
    }
    return true;
  });

  const getStatusBadge = (task: Task) => {
    const isOverdue = isTaskDeadlineReached(task);

    if (task.status === 'completado') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5 shadow-sm">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Completado
        </span>
      );
    }

    if (isOverdue) {
      return (
        <div className="space-y-1">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-flex items-center gap-1.5 animate-pulse shadow-sm">
            <BellRing className="w-3 h-3 text-rose-400" /> Plazo Cumplido
          </span>
          <p className="text-[9px] text-rose-400 font-mono font-semibold">{getOverdueDurationText(task)}</p>
        </div>
      );
    }

    switch (task.status) {
      case 'en_progreso':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 inline-flex items-center gap-1.5 shadow-sm">
            <Hourglass className="w-3 h-3 text-blue-400 animate-spin" /> En Progreso
          </span>
        );
      case 'retrasado':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 inline-flex items-center gap-1.5 shadow-sm">
            <AlertCircle className="w-3 h-3 text-rose-400" /> Retrasado
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 inline-flex items-center gap-1.5 shadow-sm">
            <Clock className="w-3 h-3 text-slate-400" /> Pendiente
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgente':
        return (
          <span className="text-[9.5px] font-extrabold text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-md border border-rose-500/30 tracking-wider">
            URGENTE
          </span>
        );
      case 'alta':
        return (
          <span className="text-[9.5px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30 tracking-wider">
            ALTA
          </span>
        );
      case 'media':
        return (
          <span className="text-[9.5px] font-bold text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-md border border-blue-500/30 tracking-wider">
            MEDIA
          </span>
        );
      default:
        return (
          <span className="text-[9.5px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60 tracking-wider">
            BAJA
          </span>
        );
    }
  };

  const overdueCount = tasks.filter((t) => isTaskDeadlineReached(t)).length;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto text-slate-100">
      
      {/* ========================================================================= */}
      {/* FILTER & CONTROL TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/85 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Worker Selector Filter */}
          <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <User className="w-3.5 h-3.5 text-blue-400" />
            <select
              id="filter-worker-select"
              value={selectedWorkerFilter}
              onChange={(e) => setSelectedWorkerFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">Todos los Colaboradores ({workers.length})</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id} className="bg-slate-900 text-slate-200">
                  {w.name} ({w.role.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <select
              id="filter-status-select"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">Todos los Estados</option>
              {overdueCount > 0 && (
                <option value="overdue" className="bg-slate-900 text-rose-400 font-bold">⏰ Plazo Cumplido ({overdueCount})</option>
              )}
              <option value="en_progreso" className="bg-slate-900 text-slate-200">En Progreso</option>
              <option value="completado" className="bg-slate-900 text-slate-200">Completados</option>
              <option value="pendiente" className="bg-slate-900 text-slate-200">Pendientes</option>
              <option value="retrasado" className="bg-slate-900 text-slate-200">Retrasados</option>
            </select>
          </div>

          {/* Local Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar tareas..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-slate-200 placeholder-slate-400 outline-none w-48 transition-all"
            />
          </div>
        </div>

        {/* View Mode & Add Task Button */}
        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'kanban' 
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          <button
            id="add-new-task-btn"
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-blue-600/25 transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Programar Trabajo</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW CONTENT: TABLE OR KANBAN */}
      {/* ========================================================================= */}
      {viewMode === 'table' ? (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950/80 text-[10px] uppercase text-slate-400 font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Trabajo / Tarea</th>
                  <th className="px-4 py-3.5">Responsable</th>
                  <th className="px-4 py-3.5">Prioridad</th>
                  <th className="px-4 py-3.5">Inicio</th>
                  <th className="px-4 py-3.5">Entrega Estimada</th>
                  <th className="px-4 py-3.5">Entrega Real</th>
                  <th className="px-4 py-3.5 text-center">Horas Est. vs Real</th>
                  <th className="px-4 py-3.5 text-center">Eficiencia</th>
                  <th className="px-4 py-3.5">Estado</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-800/60">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-slate-400">
                      <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                      <p className="font-semibold text-slate-300">No hay tareas con los filtros seleccionados</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Prueba cambiando el colaborador o limpiando la búsqueda.</p>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const worker = workers.find((w) => w.id === task.workerId);
                    const isPositive = task.efficiencyPercentage >= 0;
                    const isOverdue = isTaskDeadlineReached(task);

                    return (
                      <tr 
                        key={task.id} 
                        className={`transition-colors group ${
                          isOverdue ? 'bg-rose-500/5 hover:bg-rose-500/10' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="px-5 py-3.5 max-w-xs">
                          <p className="font-bold text-slate-100 leading-snug group-hover:text-blue-400 transition-colors">
                            {task.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{task.description}</p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium border border-slate-700/60">
                              {task.category}
                            </span>
                            {task.tags.map((t) => (
                              <span key={t} className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            {worker?.avatarUrl ? (
                              <img 
                                src={worker.avatarUrl} 
                                alt={task.workerName} 
                                className="w-7 h-7 rounded-xl object-cover border border-slate-700 shadow-xs shrink-0" 
                              />
                            ) : (
                              <div className={`w-7 h-7 rounded-xl ${worker?.avatarColor || 'bg-slate-800 text-slate-300'} border border-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs`}>
                                {worker?.initials || task.workerName.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-200 text-xs">{task.workerName}</p>
                              <p className="text-[10px] text-slate-400">{worker?.role.split(' ')[0]}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          {getPriorityBadge(task.priority)}
                        </td>

                        <td className="px-4 py-3.5 text-slate-300">
                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {task.startDate}
                          </div>
                          {task.startTime && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 font-mono">
                              <Clock className="w-2.5 h-2.5 text-slate-400" />
                              {task.startTime}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-slate-300">
                          <div className={`flex items-center gap-1 font-mono text-[11px] ${isOverdue ? 'text-rose-400 font-bold' : ''}`}>
                            <Calendar className={`w-3 h-3 ${isOverdue ? 'text-rose-400' : 'text-blue-400'}`} />
                            {task.estimatedDeliveryDate}
                          </div>
                          {task.estimatedDeliveryTime && (
                            <div className={`flex items-center gap-1 text-[10px] font-medium mt-0.5 font-mono ${isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                              <Clock className="w-2.5 h-2.5" />
                              {task.estimatedDeliveryTime}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-slate-300">
                          {task.actualDeliveryDate ? (
                            <div>
                              <div className="flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-400">
                                <Check className="w-3 h-3" />
                                {task.actualDeliveryDate}
                              </div>
                              {task.actualDeliveryTime && (
                                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                  {task.actualDeliveryTime}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">En curso</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-center font-mono">
                          <span className="text-slate-400">{task.estimatedHours}h est.</span>
                          <span className="text-slate-400 mx-1">/</span>
                          <span className="font-bold text-slate-200">
                            {task.actualHours > 0 ? `${task.actualHours}h real` : '—'}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          {task.status === 'completado' ? (
                            <span
                              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold inline-flex items-center gap-0.5 border ${
                                isPositive
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              }`}
                            >
                              {isPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                              {isPositive ? `+${task.efficiencyPercentage}%` : `${task.efficiencyPercentage}%`}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px] font-mono">En curso</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          {getStatusBadge(task)}
                        </td>

                        <td className="px-5 py-3.5 text-right space-x-1.5">
                          {task.status !== 'completado' && (
                            <button
                              id={`complete-task-${task.id}`}
                              title="Marcar como completado"
                              onClick={() => onUpdateTaskStatus(task.id, 'completado')}
                              className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-all cursor-pointer inline-block"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            id={`edit-task-${task.id}`}
                            title="Editar tarea"
                            onClick={() => onEditTask(task)}
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-all cursor-pointer inline-block"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-task-${task.id}`}
                            title="Eliminar tarea"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTask(task.id);
                            }}
                            className="p-1.5 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-all inline-block cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['pendiente', 'en_progreso', 'completado', 'retrasado'] as TaskStatus[]).map((colStatus) => {
            const colTasks = filteredTasks.filter((t) => t.status === colStatus);
            const colTitle = 
              colStatus === 'pendiente' ? 'Pendientes' :
              colStatus === 'en_progreso' ? 'En Progreso' :
              colStatus === 'completado' ? 'Completados' : 'Retrasados';

            return (
              <div 
                key={colStatus} 
                className="bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800 flex flex-col space-y-3 min-h-[480px]"
              >
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      colStatus === 'completado' ? 'bg-emerald-400' :
                      colStatus === 'en_progreso' ? 'bg-blue-400' :
                      colStatus === 'retrasado' ? 'bg-rose-400' : 'bg-slate-500'
                    }`} />
                    {colTitle}
                  </h4>
                  <span className="text-xs bg-slate-800 text-slate-300 font-mono font-bold px-2 py-0.5 rounded-full border border-slate-700">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.map((t) => {
                    const worker = workers.find((w) => w.id === t.workerId);
                    const isOverdue = isTaskDeadlineReached(t);

                    return (
                      <div
                        key={t.id}
                        className={`bg-slate-950/80 p-4 rounded-xl border shadow-md transition-all space-y-2.5 group hover:translate-y-[-2px] ${
                          isOverdue ? 'border-rose-500/50 bg-rose-500/5' : 'border-slate-800 hover:border-blue-500/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <p className="font-bold text-xs text-slate-100 leading-snug group-hover:text-blue-400 transition-colors">
                            {t.title}
                          </p>
                          {getPriorityBadge(t.priority)}
                        </div>

                        {isOverdue && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded-lg animate-pulse">
                            <BellRing className="w-3 h-3 text-rose-400 shrink-0" />
                            <span className="font-mono">{getOverdueDurationText(t)}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                          <div className="flex items-center gap-2">
                            {worker?.avatarUrl ? (
                              <img 
                                src={worker.avatarUrl} 
                                alt={t.workerName} 
                                className="w-5 h-5 rounded-full object-cover border border-slate-700" 
                              />
                            ) : (
                              <div className={`w-5 h-5 rounded-full border text-[9px] flex items-center justify-center font-bold ${worker?.avatarColor}`}>
                                {worker?.initials}
                              </div>
                            )}
                            <span className="font-medium text-slate-200">{t.workerName.split(' ')[0]}</span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">
                            {t.estimatedHours}h est.
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-900">
                          <span className={`font-mono ${isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                            {t.estimatedDeliveryDate}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            {t.status !== 'completado' && (
                              <button
                                onClick={() => onUpdateTaskStatus(t.id, 'completado')}
                                title="Marcar completada"
                                className="text-emerald-400 hover:bg-emerald-500/20 p-1 rounded-md transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => onEditTask(t)}
                              title="Editar"
                              className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-md transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`kanban-delete-task-${t.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTask(t.id);
                              }}
                              title="Eliminar"
                              className="text-rose-400 hover:bg-rose-500/20 p-1 rounded-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
