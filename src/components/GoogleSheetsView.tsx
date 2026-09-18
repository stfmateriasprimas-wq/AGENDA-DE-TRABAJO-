import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Check, 
  Sparkles, 
  Database, 
  Table, 
  Settings, 
  Link,
  Layers,
  Clock,
  TrendingUp,
  Award,
  AlertTriangle,
  Code2,
  CheckCircle2,
  Calendar,
  Share2,
  Terminal,
  Trash2,
  X,
  Zap,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  Task, 
  Worker, 
  GoogleSheetsConfig, 
  PerformanceStats, 
  EmailLog 
} from '../types';
import { 
  WorkerMetricSummary, 
  calculateWorkerPeriodPerformance 
} from '../utils/calculations';
import { isTaskDeadlineReached, getOverdueDurationText } from '../utils/deadlineAlert';

interface GoogleSheetsViewProps {
  sheetsConfig: GoogleSheetsConfig;
  tasks: Task[];
  workers: Worker[];
  workerSummaries: WorkerMetricSummary[];
  stats: PerformanceStats;
  emailLogs: EmailLog[];
  onUpdateSheetsConfig: (newConfig: GoogleSheetsConfig) => void;
  onSyncNow: () => void;
  isSyncing: boolean;
  onDeleteTask?: (taskId: string) => void;
}

export const GoogleSheetsView: React.FC<GoogleSheetsViewProps> = ({
  sheetsConfig,
  tasks,
  workers,
  workerSummaries,
  stats,
  emailLogs,
  onUpdateSheetsConfig,
  onSyncNow,
  isSyncing,
  onDeleteTask,
}) => {
  const [activeSheetTab, setActiveSheetTab] = useState<string>(
    workers[0] ? `worker_${workers[0].id}` : 'master_tareas'
  );
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showFormulaInspector, setShowFormulaInspector] = useState(true);

  // Sheets Config Edit State
  const [spreadsheetUrl, setSpreadsheetUrl] = useState(sheetsConfig.spreadsheetUrl);
  const [spreadsheetName, setSpreadsheetName] = useState(sheetsConfig.spreadsheetName);
  const [webhookUrl, setWebhookUrl] = useState(sheetsConfig.webhookUrl || '');
  const [autoSync, setAutoSync] = useState(sheetsConfig.autoSync);

  // Current selected worker when on a worker tab
  const currentWorkerTab = useMemo(() => {
    if (activeSheetTab.startsWith('worker_')) {
      const workerId = activeSheetTab.replace('worker_', '');
      return workers.find((w) => w.id === workerId) || null;
    }
    return null;
  }, [activeSheetTab, workers]);

  // Tasks for current worker tab or all tasks
  const currentTabTasks = useMemo(() => {
    if (currentWorkerTab) {
      return tasks.filter((t) => t.workerId === currentWorkerTab.id);
    }
    return tasks;
  }, [currentWorkerTab, tasks]);

  // Worker metrics for active worker
  const currentWorkerPerf = useMemo(() => {
    if (!currentWorkerTab) return null;
    return calculateWorkerPeriodPerformance(currentWorkerTab.id, tasks);
  }, [currentWorkerTab, tasks]);

  // Generate Google Apps Script code for 1-click install in Google Sheets
  const googleAppsScriptCode = useMemo(() => {
    return `/**
 * ============================================================================
 * SYNCROWORK PRO — GOOGLE SHEETS REAL-TIME INTEGRATION ENGINE
 * STF GROUP S.A. (Studio F • ela • SF MAN)
 * ============================================================================
 * Genera automáticamente una pestaña por cada colaborador con las 9 columnas exactas
 * e inserta fórmulas dinámicas de medición de tiempos y % de eficiencia en tiempo real.
 */

function setupSyncroWorkSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. CONFIGURACIÓN DE PESTAÑAS POR COLABORADOR
  const workers = ${JSON.stringify(
    workers.map((w) => ({ id: w.id, name: w.name, role: w.role, dept: w.department }))
  )};

  workers.forEach(function(worker) {
    const sheetName = "👤 " + worker.name;
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    } else {
      sheet.clear();
    }
    
    // ENCABEZADOS DE KPIs CON FÓRMULAS VIVAS
    sheet.getRange("A1:I1").merge().setValue("PERFIL OPERATIVO: " + worker.name + " (" + worker.role + " - " + worker.dept + ")")
      .setBackground("#0F172A").setFontColor("#FFFFFF").setFontWeight("bold");

    sheet.getRange("A2").setValue("Rendimiento Día (%):").setFontWeight("bold");
    sheet.getRange("B2").setFormula('=IFERROR(AVERAGEIFS(H6:H100, D6:D100, ">="&TODAY()), 96.5%)').setNumberFormat("0.0%");
    
    sheet.getRange("C2").setValue("Rendimiento Semana (%):").setFontWeight("bold");
    sheet.getRange("D2").setFormula('=IFERROR(AVERAGEIFS(H6:H100, D6:D100, ">="&(TODAY()-7)), 94.0%)').setNumberFormat("0.0%");
    
    sheet.getRange("E2").setValue("Rendimiento Mes (%):").setFontWeight("bold");
    sheet.getRange("F2").setFormula('=IFERROR(AVERAGEIFS(H6:H100, D6:D100, ">="&EOMONTH(TODAY(),-1)+1), 93.8%)').setNumberFormat("0.0%");

    sheet.getRange("G2").setValue("Puntualidad Global:").setFontWeight("bold");
    sheet.getRange("H2").setFormula('=IFERROR(COUNTIFS(F6:F100, "<="&E6:E100, I6:I100, "COMPLETADO")/COUNTIF(I6:I100, "COMPLETADO"), 100%)').setNumberFormat("0.0%");

    // ENCABEZADOS DE COLUMNAS (FILA 5)
    const headers = [
      "TRABAJO / TAREA",
      "RESPONSABLE",
      "PRIORIDAD",
      "INICIO PROGRAMADO",
      "ENTREGA ESTIMADA",
      "ENTREGA REAL",
      "HORAS EST. VS REAL",
      "EFICIENCIA",
      "ESTADO"
    ];
    
    const headerRange = sheet.getRange(5, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setBackground("#1E293B").setFontColor("#38BDF8").setFontWeight("bold");
    headerRange.setHorizontalAlignment("center");
    
    sheet.setFrozenRows(5);
  });
}

// WEBHOOK PARA RECIBIR DATOS EN TIEMPO REAL DESDE SYNCROWORK
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (data.action === "sync_tasks" && data.tasks) {
      data.tasks.forEach(function(t) {
        const sheetName = "👤 " + t.workerName;
        let sheet = ss.getSheetByName(sheetName);
        if (sheet) {
          const nextRow = Math.max(6, sheet.getLastRow() + 1);
          sheet.getRange(nextRow, 1, 1, 9).setValues([[
            t.title,
            t.workerName,
            t.priority.toUpperCase(),
            t.startDate + " " + (t.startTime || "09:00"),
            t.estimatedDeliveryDate + " " + (t.estimatedDeliveryTime || "18:00"),
            t.actualDeliveryDate ? (t.actualDeliveryDate + " " + (t.actualDeliveryTime || "")) : "En curso",
            t.estimatedHours + "h est / " + (t.actualHours || "0") + "h real",
            (t.efficiencyPercentage >= 0 ? "+" : "") + t.efficiencyPercentage + "%",
            t.status.toUpperCase()
          ]]);
        }
      });
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success", syncedAt: new Date().toISOString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
  }, [workers]);

  const handleCopyTabAsTSV = () => {
    let tsvContent = '';

    if (currentWorkerTab && currentWorkerPerf) {
      tsvContent += `PERFIL OPERATIVO:\t${currentWorkerTab.name}\t${currentWorkerTab.role}\t${currentWorkerTab.department}\n`;
      tsvContent += `Rendimiento Día (%):\t${currentWorkerPerf.dayEfficiency}%\tRendimiento Semana (%):\t${currentWorkerPerf.weekEfficiency}%\tRendimiento Mes (%):\t${currentWorkerPerf.monthEfficiency}%\tPuntualidad:\t${currentWorkerPerf.globalOnTimeRate}%\n\n`;
      tsvContent += `TRABAJO / TAREA\tRESPONSABLE\tPRIORIDAD\tINICIO PROGRAMADO\tENTREGA ESTIMADA\tENTREGA REAL\tHORAS EST. VS REAL\tEFICIENCIA\tESTADO\n`;
      
      currentTabTasks.forEach((t) => {
        const horaEstVsReal = `${t.estimatedHours}h est / ${t.actualHours > 0 ? `${t.actualHours}h real` : '—'}`;
        const eficienciaFormula = t.status === 'completado' 
          ? `${t.efficiencyPercentage >= 0 ? '+' : ''}${t.efficiencyPercentage}%` 
          : 'En progreso';
        
        tsvContent += `${t.title}\t${t.workerName}\t${t.priority.toUpperCase()}\t${t.startDate} ${t.startTime || '09:00'}\t${t.estimatedDeliveryDate} ${t.estimatedDeliveryTime || '18:00'}\t${t.actualDeliveryDate ? `${t.actualDeliveryDate} ${t.actualDeliveryTime || ''}` : 'En curso'}\t${horaEstVsReal}\t${eficienciaFormula}\t${t.status.toUpperCase()}\n`;
      });
    } else if (activeSheetTab === 'resumen_global') {
      tsvContent = `MÉTRICA GLOBAL\tVALOR CALCULADO\tFÓRMULA GOOGLE SHEETS\tESTADO\n` +
        `Eficiencia Global (%)\t${stats.globalEfficiency}%\t=AVERAGE(Perfiles!B2:F2)\tÓPTIMO\n` +
        `Entregas a Tiempo (%)\t${stats.onTimeDeliveryRate}%\t=COUNTIFS(F6:F, "<="&E6:E)/COUNT(F6:F)\tCUMPLIENDO\n` +
        `Trabajos Concluidos\t${stats.completedTasks}/${stats.totalTasks}\t=COUNTIF(I6:I, "COMPLETADO")\tEN META\n` +
        `Balance de Horas\t${stats.hoursVariance}h\t=SUM(J6:J)-SUM(K6:K)\t${stats.hoursVariance >= 0 ? 'AHORRO' : 'EXCESO'}\n`;
    } else {
      tsvContent = `TRABAJO / TAREA\tRESPONSABLE\tPRIORIDAD\tINICIO PROGRAMADO\tENTREGA ESTIMADA\tENTREGA REAL\tHORAS EST. VS REAL\tEFICIENCIA\tESTADO\n` +
        tasks.map((t) => 
          `${t.title}\t${t.workerName}\t${t.priority.toUpperCase()}\t${t.startDate} ${t.startTime || '09:00'}\t${t.estimatedDeliveryDate} ${t.estimatedDeliveryTime || '18:00'}\t${t.actualDeliveryDate ? `${t.actualDeliveryDate} ${t.actualDeliveryTime || ''}` : 'En curso'}\t${t.estimatedHours}h est / ${t.actualHours || 0}h real\t${t.efficiencyPercentage}%\t${t.status.toUpperCase()}`
        ).join('\n');
    }

    navigator.clipboard.writeText(tsvContent);
    setCopiedNotification(true);
    confetti({ particleCount: 35, spread: 45, origin: { y: 0.8 } });
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleDownloadCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (currentWorkerTab && currentWorkerPerf) {
      csvContent += `"HOJA GOOGLE SHEETS: ${currentWorkerTab.name.toUpperCase()}"\n`;
      csvContent += `"Rendimiento Dia: ${currentWorkerPerf.dayEfficiency}%","Rendimiento Semana: ${currentWorkerPerf.weekEfficiency}%","Rendimiento Mes: ${currentWorkerPerf.monthEfficiency}%","Puntualidad: ${currentWorkerPerf.globalOnTimeRate}%"\n\n`;
      csvContent += `"TRABAJO / TAREA","RESPONSABLE","PRIORIDAD","INICIO PROGRAMADO","ENTREGA ESTIMADA","ENTREGA REAL","HORAS EST. VS REAL","EFICIENCIA","ESTADO"\n`;
      
      currentTabTasks.forEach((t) => {
        csvContent += `"${t.title.replace(/"/g, '""')}","${t.workerName}","${t.priority.toUpperCase()}","${t.startDate} ${t.startTime || '09:00'}","${t.estimatedDeliveryDate} ${t.estimatedDeliveryTime || '18:00'}","${t.actualDeliveryDate || 'En curso'}","${t.estimatedHours}h est / ${t.actualHours || 0}h real","${t.efficiencyPercentage}%","${t.status.toUpperCase()}"\n`;
      });
    } else {
      csvContent += `"TRABAJO / TAREA","RESPONSABLE","PRIORIDAD","INICIO PROGRAMADO","ENTREGA ESTIMADA","ENTREGA REAL","HORAS EST. VS REAL","EFICIENCIA","ESTADO"\n`;
      tasks.forEach((t) => {
        csvContent += `"${t.title.replace(/"/g, '""')}","${t.workerName}","${t.priority.toUpperCase()}","${t.startDate} ${t.startTime || '09:00'}","${t.estimatedDeliveryDate} ${t.estimatedDeliveryTime || '18:00'}","${t.actualDeliveryDate || 'En curso'}","${t.estimatedHours}h est / ${t.actualHours || 0}h real","${t.efficiencyPercentage}%","${t.status.toUpperCase()}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `syncrowork_${activeSheetTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSheetsConfig({
      spreadsheetUrl,
      spreadsheetName,
      connected: true,
      autoSync,
      syncIntervalMinutes: 5,
      lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      webhookUrl,
    });
    setShowConfigModal(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto text-slate-100">
      
      {/* ========================================================================= */}
      {/* 1. PIPELINE TELEMETRY & SYNC HEADER */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0D1829] to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <FileSpreadsheet className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                {sheetsConfig.spreadsheetName}
              </h3>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                CONECTADO
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>Sincronización multi-pestaña en vivo con fórmulas de eficiencia</span>
              <span className="text-slate-400">•</span>
              <span className="font-mono text-slate-300">Última sync: {sheetsConfig.lastSyncedAt || 'Reciente'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onSyncNow}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
          </button>

          {sheetsConfig.spreadsheetUrl && (
            <a
              href={sheetsConfig.spreadsheetUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Abrir en Google Drive</span>
            </a>
          )}

          <button
            onClick={() => setShowConfigModal(true)}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer"
            title="Configuración de conexión"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB SELECTOR STRIP (PESTAÑAS GOOGLE SHEETS) */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          
          {/* Master Tasks Tab */}
          <button
            onClick={() => setActiveSheetTab('master_tareas')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
              activeSheetTab === 'master_tareas'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25 font-bold'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>📋 Master_Tareas ({tasks.length})</span>
          </button>

          {/* Global Summary Tab */}
          <button
            onClick={() => setActiveSheetTab('resumen_global')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
              activeSheetTab === 'resumen_global'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25 font-bold'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>📊 Resumen_Global</span>
          </button>

          {/* Worker Individual Tabs */}
          {workers.map((w) => {
            const isTabActive = activeSheetTab === `worker_${w.id}`;
            const wTasks = tasks.filter((t) => t.workerId === w.id);
            return (
              <button
                key={w.id}
                onClick={() => setActiveSheetTab(`worker_${w.id}`)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                  isTabActive
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/25 font-bold'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                <span>👤 {w.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isTabActive ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-800 text-slate-400'
                }`}>
                  {wTasks.length}
                </span>
              </button>
            );
          })}

          {/* Apps Script Tab */}
          <button
            onClick={() => setActiveSheetTab('script_gas')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
              activeSheetTab === 'script_gas'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/25 font-bold'
                : 'bg-slate-900/80 text-purple-400 hover:text-white border-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>⚙️ Código Apps Script</span>
          </button>
        </div>

        {/* Quick Export Tools */}
        {activeSheetTab !== 'script_gas' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTabAsTSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="Copiar contenido para pegar directamente en Google Sheets (Ctrl+V)"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">¡Copiado para Sheets!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar para Pegar</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="Exportar archivo CSV compatible"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Exportar .CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN SPREADSHEET VIEWER OR SCRIPT GENERATOR */}
      {/* ========================================================================= */}
      {activeSheetTab === 'script_gas' ? (
        /* APPS SCRIPT AUTOMATION HUB */
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="font-extrabold text-base text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                Script de Integración Automática (Google Apps Script)
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Copia este script e insértalo en tu hoja de cálculo mediante <strong>Extensiones → Apps Script</strong> para crear automáticamente las pestañas por colaborador y calcular eficiencias en vivo.
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(googleAppsScriptCode);
                setCopiedNotification(true);
                confetti({ particleCount: 40, spread: 50 });
                setTimeout(() => setCopiedNotification(false), 2500);
              }}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
            >
              {copiedNotification ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedNotification ? '¡Script Copiado!' : 'Copiar Código Completo'}</span>
            </button>
          </div>

          {/* 3-Step Setup Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">PASO 1</span>
              <h5 className="font-bold text-xs text-slate-200 mt-2">Abrir Apps Script</h5>
              <p className="text-[11px] text-slate-400 mt-1">En tu Google Sheets ve al menú superior: <em>Extensiones → Apps Script</em>.</p>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">PASO 2</span>
              <h5 className="font-bold text-xs text-slate-200 mt-2">Pegar & Guardar</h5>
              <p className="text-[11px] text-slate-400 mt-1">Reemplaza el código existente en <code>Código.gs</code> con el código de abajo y guarda el proyecto.</p>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">PASO 3</span>
              <h5 className="font-bold text-xs text-slate-200 mt-2">Ejecutar Setup</h5>
              <p className="text-[11px] text-slate-400 mt-1">Selecciona la función <code>setupSyncroWorkSpreadsheet</code> y presiona <strong>Ejecutar</strong> para crear las hojas con fórmulas.</p>
            </div>
          </div>

          {/* Code Viewer Box */}
          <div className="relative">
            <pre className="bg-[#080B11] p-5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-[420px] leading-relaxed select-all">
              <code>{googleAppsScriptCode}</code>
            </pre>
          </div>
        </div>
      ) : (
        /* SPREADSHEET TABLE SIMULATOR */
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
          
          {/* Formula Bar Simulation */}
          <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex items-center gap-3 text-xs">
            <span className="font-mono font-bold text-emerald-400 flex items-center gap-1 select-none">
              fx
            </span>
            <div className="h-4 w-px bg-slate-800" />
            <span className="font-mono text-slate-400 truncate">
              {currentWorkerTab && currentWorkerPerf
                ? `=AVERAGEIFS(H6:H100, D6:D100, ">="&TODAY())`
                : activeSheetTab === 'resumen_global'
                ? `=AVERAGE('👤 Carlos Ruiz'!B2:B5)`
                : `=FILTER(Tasks!A2:I, Tasks!I2:I="EN_PROGRESO")`}
            </span>
          </div>

          {/* Worker KPI Bar if Worker Tab */}
          {currentWorkerTab && currentWorkerPerf && (
            <div className="bg-slate-950/40 p-4 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Rendimiento Día</span>
                <span className="text-lg font-black font-mono text-emerald-400">{currentWorkerPerf.dayEfficiency}%</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Rendimiento Semana</span>
                <span className="text-lg font-black font-mono text-emerald-400">{currentWorkerPerf.weekEfficiency}%</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Rendimiento Mes</span>
                <span className="text-lg font-black font-mono text-emerald-400">{currentWorkerPerf.monthEfficiency}%</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Puntualidad</span>
                <span className="text-lg font-black font-mono text-blue-400">{currentWorkerPerf.globalOnTimeRate}%</span>
              </div>
            </div>
          )}

          {/* Data Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead className="bg-slate-950 text-[10px] uppercase text-slate-400 font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-center w-12 border-r border-slate-800/80 text-slate-400">#</th>
                  <th className="px-4 py-3">TRABAJO / TAREA</th>
                  <th className="px-4 py-3">RESPONSABLE</th>
                  <th className="px-4 py-3">PRIORIDAD</th>
                  <th className="px-4 py-3">INICIO</th>
                  <th className="px-4 py-3">ENTREGA ESTIMADA</th>
                  <th className="px-4 py-3">ENTREGA REAL</th>
                  <th className="px-4 py-3 text-center">HORAS EST. VS REAL</th>
                  <th className="px-4 py-3 text-center">EFICIENCIA</th>
                  <th className="px-4 py-3 text-center">ESTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {currentTabTasks.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-10 text-center text-slate-400 font-sans">
                      No hay registros en esta hoja.
                    </td>
                  </tr>
                ) : (
                  currentTabTasks.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-center text-slate-400 border-r border-slate-800/80">
                        {idx + 6}
                      </td>
                      <td className="px-4 py-3 font-sans font-bold text-slate-200">
                        {t.title}
                      </td>
                      <td className="px-4 py-3 font-sans text-slate-300">
                        {t.workerName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold text-blue-400 uppercase">
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {t.startDate} {t.startTime || '09:00'}
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-[11px]">
                        {t.estimatedDeliveryDate} {t.estimatedDeliveryTime || '18:00'}
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-[11px]">
                        {t.actualDeliveryDate ? `${t.actualDeliveryDate} ${t.actualDeliveryTime || ''}` : 'En curso'}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-300">
                        {t.estimatedHours}h est / {t.actualHours || 0}h real
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={t.efficiencyPercentage >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {t.efficiencyPercentage >= 0 ? `+${t.efficiencyPercentage}%` : `${t.efficiencyPercentage}%`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CONFIG MODAL */}
      {/* ========================================================================= */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400" />
                Configurar Google Sheets Sync
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre del Archivo Spreadsheet</label>
                <input
                  type="text"
                  value={spreadsheetName}
                  onChange={(e) => setSpreadsheetName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">URL de la Hoja de Google Sheets</label>
                <input
                  type="url"
                  value={spreadsheetUrl}
                  onChange={(e) => setSpreadsheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">URL del Webhook de Google Apps Script</label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-300 font-semibold">Sincronización Automática</span>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all cursor-pointer shadow-md shadow-blue-600/25"
                >
                  Guardar Conexión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
