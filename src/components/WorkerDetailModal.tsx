import React from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Hourglass, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Trash2,
  ShieldCheck,
  Award,
  Activity
} from 'lucide-react';
import { Worker, Task } from '../types';
import { WorkerMetricSummary } from '../utils/calculations';

interface WorkerDetailModalProps {
  worker: Worker | null;
  summary: WorkerMetricSummary | undefined;
  tasks: Task[];
  onClose: () => void;
  onOpenNewTaskModalForWorker: (workerId: string) => void;
  onDeleteWorker?: (workerId: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const WorkerDetailModal: React.FC<WorkerDetailModalProps> = ({
  worker,
  summary,
  tasks,
  onClose,
  onOpenNewTaskModalForWorker,
  onDeleteWorker,
  onDeleteTask,
}) => {
  if (!worker) return null;

  const workerTasks = tasks.filter((t) => t.workerId === worker.id);
  const isPositive = (summary?.avgEfficiency || 0) >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-700/80 shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {worker.avatarUrl ? (
                <img 
                  src={worker.avatarUrl} 
                  alt={worker.name} 
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
                />
              ) : (
                <div className={`w-14 h-14 rounded-2xl border-2 border-slate-700 text-base flex items-center justify-center font-bold shadow-md ${worker.avatarColor}`}>
                  {worker.initials}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-[#090D16]">
                <ShieldCheck className="w-2.5 h-2.5 text-white" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-extrabold text-white tracking-tight">{worker.name}</h2>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  {worker.status.toUpperCase()}
                </span>
                {(worker.faceEnrolled || worker.avatarUrl) && (
                  <span className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    Face ID Enrolled
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 mt-0.5">{worker.role} • {worker.department}</p>
              
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-blue-400" /> {worker.email}</span>
                {worker.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-blue-400" /> {worker.phone}</span>}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Evaluation Metrics Bento Strip */}
        <div className="bg-slate-950/40 border-b border-slate-800 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Eficiencia Media</span>
            <span className={`text-base font-black font-mono inline-flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {isPositive ? `+${summary?.avgEfficiency || 0}%` : `${summary?.avgEfficiency || 0}%`}
            </span>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Puntualidad</span>
            <span className="text-base font-black font-mono text-blue-400">{summary?.onTimeRate || 100}%</span>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Horas Invertidas</span>
            <span className="text-base font-bold text-white font-mono">{summary?.totalActualHours || 0}h / {summary?.totalEstimatedHours || 0}h</span>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Balance de Horas</span>
            <span className={`text-base font-bold font-mono ${(summary?.hoursVariance || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {(summary?.hoursVariance || 0) >= 0 ? `+${summary?.hoursVariance}h` : `${summary?.hoursVariance}h`}
            </span>
          </div>
        </div>

        {/* Task Evaluation Table */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Historial de Tareas y Plazos de Entrega ({workerTasks.length})
            </h3>
            <button
              onClick={() => onOpenNewTaskModalForWorker(worker.id)}
              className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-md shadow-blue-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Asignar Nueva Tarea
            </button>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-lg bg-slate-950/40">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-950 text-[10px] uppercase text-slate-400 font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Tarea</th>
                  <th className="px-3 py-3">Inicio</th>
                  <th className="px-3 py-3">Entrega Estimada</th>
                  <th className="px-3 py-3">Entrega Real</th>
                  <th className="px-3 py-3 text-center">Horas</th>
                  <th className="px-3 py-3 text-center">Eficiencia</th>
                  {onDeleteTask && <th className="px-3 py-3 text-right">Acción</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {workerTasks.length === 0 ? (
                  <tr>
                    <td colSpan={onDeleteTask ? 7 : 6} className="px-4 py-8 text-center text-slate-400">
                      No hay tareas asignadas para este colaborador actualmente.
                    </td>
                  </tr>
                ) : (
                  workerTasks.map((task) => {
                    const isTaskPositive = task.efficiencyPercentage >= 0;
                    return (
                      <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-200">{task.title}</p>
                          <span className="text-[10px] text-slate-400">{task.category}</span>
                        </td>
                        <td className="px-3 py-3 text-slate-400 font-mono text-[11px]">
                          {task.startDate} {task.startTime || ''}
                        </td>
                        <td className="px-3 py-3 text-blue-400 font-mono text-[11px]">
                          {task.estimatedDeliveryDate} {task.estimatedDeliveryTime || ''}
                        </td>
                        <td className="px-3 py-3 text-slate-300 font-mono text-[11px]">
                          {task.actualDeliveryDate ? `${task.actualDeliveryDate} ${task.actualDeliveryTime || ''}` : 'En curso'}
                        </td>
                        <td className="px-3 py-3 text-center font-mono text-slate-300">
                          {task.estimatedHours}h / {task.actualHours > 0 ? `${task.actualHours}h` : '—'}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {task.status === 'completado' ? (
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border ${
                              isTaskPositive 
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}>
                              {isTaskPositive ? `+${task.efficiencyPercentage}%` : `${task.efficiencyPercentage}%`}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px] font-mono">En curso</span>
                          )}
                        </td>
                        {onDeleteTask && (
                          <td className="px-3 py-3 text-right">
                            <button
                              id={`detail-modal-delete-task-${task.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTask(task.id);
                              }}
                              title="Eliminar tarea"
                              className="text-rose-400 hover:bg-rose-500/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-3.5 flex items-center justify-between">
          <div>
            {onDeleteWorker && (
              <button
                id={`detail-modal-delete-worker-${worker.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteWorker(worker.id);
                  onClose();
                }}
                className="px-3.5 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-rose-500/30 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar Colaborador</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
