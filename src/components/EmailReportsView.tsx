import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Eye, 
  Code, 
  FileText, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  Trash2,
  X,
  Zap,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  EmailAutomationConfig, 
  EmailLog, 
  PerformanceStats, 
  Task, 
  Worker 
} from '../types';
import { 
  WorkerMetricSummary, 
  generateHtmlReport 
} from '../utils/calculations';

interface EmailReportsViewProps {
  configs: EmailAutomationConfig[];
  logs: EmailLog[];
  stats: PerformanceStats;
  workerSummaries: WorkerMetricSummary[];
  tasks: Task[];
  onToggleConfig: (id: string) => void;
  onAddConfig: (config: Omit<EmailAutomationConfig, 'id'>) => void;
  onDeleteConfig?: (id: string) => void;
  onSendInstantReport: (config: EmailAutomationConfig) => void;
}

export const EmailReportsView: React.FC<EmailReportsViewProps> = ({
  configs,
  logs,
  stats,
  workerSummaries,
  tasks,
  onToggleConfig,
  onAddConfig,
  onDeleteConfig,
  onSendInstantReport,
}) => {
  const [selectedConfigId, setSelectedConfigId] = useState<string>(configs[0]?.id || '');
  const [previewPeriod, setPreviewPeriod] = useState<'Día' | 'Semana' | 'Mes'>('Semana');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // New config form state
  const [newName, setNewName] = useState('');
  const [newFrequency, setNewFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [newTime, setNewTime] = useState('18:00');
  const [newRecipients, setNewRecipients] = useState('gerencia@stfgroup.com, operaciones@stfgroup.com');
  const [newSubject, setNewSubject] = useState('[STF GROUP] Informe de Rendimiento & Productividad');

  const activeConfig = configs.find((c) => c.id === selectedConfigId) || configs[0];

  const htmlPreview = generateHtmlReport(
    stats,
    workerSummaries,
    tasks,
    previewPeriod
  );

  const handleSendNow = () => {
    if (!activeConfig) return;
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      onSendInstantReport(activeConfig);
      setSendSuccessMessage(`Reporte ${previewPeriod} despachado con éxito a ${activeConfig.recipients.length} destinatarios.`);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
      setTimeout(() => setSendSuccessMessage(null), 5000);
    }, 1200);
  };

  const handleCreateAutomation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddConfig({
      name: newName,
      frequency: newFrequency,
      timeOfDay: newTime,
      recipients: newRecipients.split(',').map((r) => r.trim()).filter(Boolean),
      subjectTemplate: newSubject,
      includeMetrics: true,
      includeWorkerMatrix: true,
      includePendingTasks: true,
      isActive: true,
    });

    setIsCreatingNew(false);
    setNewName('');
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(htmlPreview);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto text-slate-100">
      
      {/* Top Banner Alert if Sent */}
      {sendSuccessMessage && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-5 py-3 rounded-2xl flex items-center justify-between shadow-lg shadow-emerald-500/10 animate-in fade-in">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{sendSuccessMessage}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
            200 OK • SMTP Dispatch
          </span>
        </div>
      )}

      {/* Main Grid: Scheduler (Left 5 cols) + Email Client Simulator (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: SCHEDULER & LOGS */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  Programación de Envíos
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reglas de despacho automático para directores y jefaturas
                </p>
              </div>
              <button
                onClick={() => setIsCreatingNew(!isCreatingNew)}
                className="text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 font-bold px-3 py-1.5 rounded-xl border border-blue-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Nueva Regla
              </button>
            </div>

            {/* Form to create new automation */}
            {isCreatingNew && (
              <form onSubmit={handleCreateAutomation} className="p-4 bg-slate-950/80 border border-blue-500/30 rounded-xl space-y-3 animate-in fade-in text-xs">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Nueva Automatización de Correo
                </h4>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nombre</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Reporte Ejecutivo Diario"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 mt-1 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Frecuencia</label>
                    <select
                      value={newFrequency}
                      onChange={(e) => setNewFrequency(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 mt-1 outline-none"
                    >
                      <option value="daily">Diaria</option>
                      <option value="weekly">Semanal (Viernes)</option>
                      <option value="monthly">Mensual (1ro)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Hora de Envío</label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 mt-1 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Destinatarios (separados por coma)</label>
                  <input
                    type="text"
                    required
                    value={newRecipients}
                    onChange={(e) => setNewRecipients(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 mt-1 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="px-3 py-1 bg-slate-800 text-slate-400 text-xs rounded-lg font-semibold hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg font-bold transition-all"
                  >
                    Guardar Regla
                  </button>
                </div>
              </form>
            )}

            {/* List of configs */}
            <div className="space-y-3">
              {configs.map((config) => {
                const isSelected = config.id === selectedConfigId;
                return (
                  <div
                    key={config.id}
                    onClick={() => setSelectedConfigId(config.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/50 shadow-md shadow-blue-600/10'
                        : 'bg-slate-950/60 hover:bg-slate-800/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-white">{config.name}</h4>
                          <span className="text-[9px] bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold px-1.5 py-0.2 rounded uppercase font-mono">
                            {config.frequency}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" /> Hora: {config.timeOfDay} hrs
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Toggle button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleConfig(config.id);
                          }}
                          title={config.isActive ? 'Desactivar' : 'Activar'}
                          className={`w-8 h-4.5 rounded-full relative transition-colors cursor-pointer ${
                            config.isActive ? 'bg-blue-600' : 'bg-slate-800'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${
                              config.isActive ? 'right-0.5' : 'left-0.5'
                            }`}
                          />
                        </button>

                        {onDeleteConfig && (
                          <button
                            id={`delete-email-config-${config.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteConfig(config.id);
                            }}
                            title="Eliminar regla"
                            className="text-rose-400 hover:bg-rose-500/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 truncate">
                      <span className="font-semibold text-slate-300">Para:</span> {config.recipients.join(', ')}
                    </div>

                    {config.lastSentDate && (
                      <div className="text-[9.5px] text-emerald-400 font-mono flex items-center gap-1">
                        <Check className="w-3 h-3" /> Último despacho: {config.lastSentDate}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Registro de Despachos Recientes
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2">Fecha/Hora</th>
                    <th className="py-2">Asunto</th>
                    <th className="py-2 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-[11px]">
                  {logs.slice(0, 4).map((log) => (
                    <tr key={log.id} className="text-slate-300">
                      <td className="py-2.5 font-mono text-slate-400">{log.sentAt}</td>
                      <td className="py-2.5 truncate max-w-36">{log.subject}</td>
                      <td className="py-2.5 text-right">
                        <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: SIMULATED EMAIL CLIENT FRAME */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
          
          {/* macOS / Modern Email Window Bar */}
          <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="font-bold text-xs text-white">Vista Previa del Informe de Correo</span>
            </div>

            {/* Period Selector Tabs & Action Buttons */}
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs font-semibold">
                {(['Día', 'Semana', 'Mes'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPreviewPeriod(p)}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      previewPeriod === p
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopyHtml}
                className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1"
                title="Copiar código HTML"
              >
                {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copiedHtml ? '¡Copiado!' : 'Copiar HTML'}</span>
              </button>

              <button
                onClick={handleSendNow}
                disabled={isSending}
                className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
                <span>{isSending ? 'Enviando...' : 'Despachar Ahora'}</span>
              </button>
            </div>
          </div>

          {/* Email Envelope Meta Details */}
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 text-xs space-y-1.5 font-sans">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="font-bold text-slate-300 w-16">De:</span>
              <span className="text-blue-400 font-mono">SyncroWork Pro &lt;notificaciones@stfgroup.com&gt;</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="font-bold text-slate-300 w-16">Para:</span>
              <span className="text-slate-200 font-mono truncate">{activeConfig?.recipients.join(', ') || 'gerencia@stfgroup.com'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="font-bold text-slate-300 w-16">Asunto:</span>
              <span className="text-slate-100 font-bold">{activeConfig?.subjectTemplate || '[STF GROUP] Informe de Rendimiento'} — {previewPeriod}</span>
            </div>
          </div>

          {/* Rendered Email Body in Frame */}
          <div className="flex-1 bg-white p-6 overflow-y-auto max-h-[560px] text-slate-900">
            <div 
              dangerouslySetInnerHTML={{ __html: htmlPreview }}
              className="prose max-w-none text-slate-900"
            />
          </div>

        </div>

      </div>

    </div>
  );
};
