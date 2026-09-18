import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  CheckCircle2, 
  FileText,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Check
} from 'lucide-react';
import { Task, Worker, TaskPriority, TaskStatus } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt'>, taskId?: string) => void;
  onDeleteTask?: (taskId: string) => void;
  taskToEdit?: Task | null;
  workers: Worker[];
  initialWorkerId?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDeleteTask,
  taskToEdit,
  workers,
  initialWorkerId,
}) => {
  const [workerId, setWorkerId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Desarrollo');
  const [priority, setPriority] = useState<TaskPriority>('media');
  const [status, setStatus] = useState<TaskStatus>('en_progreso');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('09:00');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState(todayStr);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('17:00');
  const [actualDeliveryDate, setActualDeliveryDate] = useState('');
  const [actualDeliveryTime, setActualDeliveryTime] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number>(4);
  const [actualHours, setActualHours] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('STF, Calidad');

  useEffect(() => {
    if (taskToEdit) {
      setWorkerId(taskToEdit.workerId);
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setCategory(taskToEdit.category);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setStartDate(taskToEdit.startDate);
      setStartTime(taskToEdit.startTime || '09:00');
      setEstimatedDeliveryDate(taskToEdit.estimatedDeliveryDate);
      setEstimatedDeliveryTime(taskToEdit.estimatedDeliveryTime || '17:00');
      setActualDeliveryDate(taskToEdit.actualDeliveryDate || '');
      setActualDeliveryTime(taskToEdit.actualDeliveryTime || '');
      setEstimatedHours(taskToEdit.estimatedHours || 4);
      setActualHours(taskToEdit.actualHours || 0);
      setNotes(taskToEdit.notes || '');
      setTags(taskToEdit.tags.join(', '));
    } else {
      setWorkerId(initialWorkerId || workers[0]?.id || '');
      setTitle('');
      setDescription('');
      setCategory('Desarrollo');
      setPriority('media');
      setStatus('en_progreso');
      setStartDate(todayStr);
      setStartTime('09:00');
      setEstimatedDeliveryDate(todayStr);
      setEstimatedDeliveryTime('17:00');
      setActualDeliveryDate('');
      setActualDeliveryTime('');
      setEstimatedHours(4);
      setActualHours(0);
      setNotes('');
      setTags('STF, Calidad');
    }
  }, [taskToEdit, initialWorkerId, workers, isOpen]);

  if (!isOpen) return null;

  // Real-time calculation of efficiency percentage
  let calculatedEfficiency = 0;
  if (actualHours > 0 && estimatedHours > 0) {
    calculatedEfficiency = Math.round(((estimatedHours - actualHours) / estimatedHours) * 1000) / 10;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !workerId) return;

    const assignedWorker = workers.find((w) => w.id === workerId);

    onSave(
      {
        title,
        description,
        workerId,
        workerName: assignedWorker ? assignedWorker.name : 'No Asignado',
        category,
        priority,
        status,
        startDate,
        startTime,
        estimatedDeliveryDate,
        estimatedDeliveryTime,
        actualDeliveryDate: status === 'completado' && !actualDeliveryDate ? todayStr : actualDeliveryDate,
        actualDeliveryTime: status === 'completado' && !actualDeliveryTime ? '17:00' : actualDeliveryTime,
        estimatedHours: Number(estimatedHours),
        actualHours: Number(actualHours),
        efficiencyPercentage: calculatedEfficiency,
        notes,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      },
      taskToEdit?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-700/80 shadow-2xl w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {taskToEdit ? 'Editar Programación de Trabajo' : 'Programar Nueva Tarea'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Control de tiempos de inicio, plazos estimados y cálculo automático de rendimiento
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Title & Category */}
          <div>
            <label className="font-bold text-slate-300 block mb-1">Título del Trabajo / Tarea *</label>
            <input
              type="text"
              required
              placeholder="Ej: Auditoría de Control de Calidad en Lote 204"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-400 outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-300 block mb-1">Descripción / Entregables</label>
            <textarea
              rows={2}
              placeholder="Detalles operativos, especificaciones y criterios de entrega..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-400 outline-none focus:border-blue-500"
            />
          </div>

          {/* Worker Selector, Category, Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Responsable Asignado *</label>
              <select
                required
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.id} className="bg-slate-900">
                    {w.name} ({w.role.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
              >
                <option value="Control de Calidad">Control de Calidad</option>
                <option value="Desarrollo Backend">Desarrollo Backend</option>
                <option value="Desarrollo Frontend">Desarrollo Frontend</option>
                <option value="Diseño UI/UX">Diseño UI/UX</option>
                <option value="Bases de Datos">Bases de Datos</option>
                <option value="Operaciones & Planta">Operaciones & Planta</option>
                <option value="Gestión & Scrum">Gestión & Scrum</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Cronograma de Ejecución y Plazos
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Fecha Inicio</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white mt-1 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Hora Inicio</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white mt-1 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Fecha Est. Entrega</label>
                <input
                  type="date"
                  required
                  value={estimatedDeliveryDate}
                  onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white mt-1 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Hora Est. Entrega</label>
                <input
                  type="time"
                  value={estimatedDeliveryTime}
                  onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white mt-1 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Actual Execution & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Horas Estimadas (Presupuesto) *</label>
              <input
                type="number"
                step="0.25"
                min="0.5"
                required
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Horas Reales Invertidas</label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={actualHours}
                onChange={(e) => setActualHours(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Estado Actual</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold"
              >
                <option value="en_progreso">En Progreso</option>
                <option value="completado">Completado</option>
                <option value="pendiente">Pendiente</option>
                <option value="retrasado">Retrasado</option>
              </select>
            </div>
          </div>

          {/* Actual Delivery Dates if Completed */}
          {status === 'completado' && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-emerald-400 uppercase">Fecha Real Entrega</label>
                <input
                  type="date"
                  value={actualDeliveryDate || todayStr}
                  onChange={(e) => setActualDeliveryDate(e.target.value)}
                  className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-white mt-1 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-emerald-400 uppercase">Hora Real Entrega</label>
                <input
                  type="time"
                  value={actualDeliveryTime || '17:00'}
                  onChange={(e) => setActualDeliveryTime(e.target.value)}
                  className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-white mt-1 font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* Efficiency Metric Live Feedback */}
          {actualHours > 0 && estimatedHours > 0 && (
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
              <span className="font-bold text-slate-300">Eficiencia Calculada:</span>
              <span className={`px-3 py-1 rounded-xl font-bold font-mono text-xs flex items-center gap-1 border ${
                calculatedEfficiency >= 0 
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              }`}>
                {calculatedEfficiency >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {calculatedEfficiency >= 0 ? `+${calculatedEfficiency}% de ahorro de tiempo` : `${calculatedEfficiency}% de desvío`}
              </span>
            </div>
          )}

          {/* Tags & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Etiquetas (separadas por coma)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Notas de Desempeño</label>
              <input
                type="text"
                placeholder="Observaciones adicionales..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-800">
            <div>
              {taskToEdit && onDeleteTask && (
                <button
                  id={`modal-delete-task-${taskToEdit.id}`}
                  type="button"
                  onClick={() => {
                    onDeleteTask(taskToEdit.id);
                    onClose();
                  }}
                  className="px-3.5 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-rose-500/30 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Tarea</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/25 transition-all cursor-pointer"
              >
                {taskToEdit ? 'Guardar Cambios' : 'Registrar y Sincronizar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
