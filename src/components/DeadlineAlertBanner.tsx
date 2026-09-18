import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Edit3, 
  X, 
  BellRing, 
  User, 
  ArrowRight,
  Trash2
} from 'lucide-react';
import { Task } from '../types';
import { getOverdueDurationText } from '../utils/deadlineAlert';

interface DeadlineAlertBannerProps {
  alerts: Task[];
  onDismissAlert: (taskId: string) => void;
  onDismissAllAlerts: () => void;
  onCompleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onTestSound?: () => void;
}

export const DeadlineAlertBanner: React.FC<DeadlineAlertBannerProps> = ({
  alerts,
  onDismissAlert,
  onDismissAllAlerts,
  onCompleteTask,
  onEditTask,
  onDeleteTask,
}) => {
  if (alerts.length === 0) return null;

  const currentAlert = alerts[0];
  const overdueText = getOverdueDurationText(currentAlert);

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in fade-in slide-in-from-top-6 duration-200">
      <div className="bg-slate-950/95 backdrop-blur-2xl text-white rounded-3xl p-4 sm:p-5 shadow-2xl border-2 border-rose-500/60 shadow-rose-600/20 flex flex-col gap-3">
        
        {/* Top bar with alert badge and counters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-400">
              <BellRing className="w-4 h-4 animate-bounce" />
            </span>
            <div>
              <h4 className="font-extrabold text-sm tracking-wide text-rose-300 flex items-center gap-2">
                <span>TIEMPO ESTIMADO CUMPLIDO</span>
                {alerts.length > 1 && (
                  <span className="bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                    +{alerts.length - 1} más
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-slate-400 font-medium">
                Se ha alcanzado la fecha y hora límite de entrega programada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onDismissAlert(currentAlert.id)}
              title="Cerrar alerta actual"
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Task Details Card */}
        <div className="bg-slate-900/80 rounded-2xl p-3.5 border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="font-bold text-white text-sm truncate">{currentAlert.title}</p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-medium bg-slate-800 px-2 py-0.5 rounded-md text-slate-300">
                <User className="w-3 h-3 text-blue-400" /> {currentAlert.workerName}
              </span>
              <span className="flex items-center gap-1 font-mono text-slate-300">
                <Clock className="w-3 h-3 text-slate-400" /> {currentAlert.estimatedDeliveryDate} {currentAlert.estimatedDeliveryTime || '17:00'}
              </span>
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-md font-bold font-mono text-[10px]">
                {overdueText}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => {
                onCompleteTask(currentAlert.id);
                onDismissAlert(currentAlert.id);
              }}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-sm shadow-emerald-600/25 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Marcar Listo</span>
            </button>
            <button
              onClick={() => {
                onEditTask(currentAlert);
                onDismissAlert(currentAlert.id);
              }}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-1.5 rounded-xl text-xs border border-slate-700 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Ajustar Plazo</span>
            </button>
            {onDeleteTask && (
              <button
                onClick={() => {
                  onDeleteTask(currentAlert.id);
                  onDismissAlert(currentAlert.id);
                }}
                className="p-1.5 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-all cursor-pointer"
                title="Eliminar tarea"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Footer if multiple alerts exist */}
        {alerts.length > 1 && (
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
            <span>Hay {alerts.length} trabajos con plazo cumplido pendientes de entrega.</span>
            <button
              onClick={onDismissAllAlerts}
              className="underline font-semibold hover:text-white cursor-pointer"
            >
              Descartar todas las alertas
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
