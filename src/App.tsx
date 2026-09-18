import React, { useState, useEffect, useMemo } from 'react';
import { 
  Worker, 
  Task, 
  EmailAutomationConfig, 
  EmailLog, 
  GoogleSheetsConfig, 
  TimeFilter, 
  TaskStatus,
  AuthUser
} from './types';
import { 
  INITIAL_WORKERS, 
  INITIAL_TASKS, 
  INITIAL_EMAIL_CONFIGS, 
  INITIAL_EMAIL_LOGS, 
  INITIAL_SHEETS_CONFIG 
} from './data/initialData';
import { 
  filterTasksByTime, 
  calculatePerformanceStats, 
  calculateWorkerMetrics 
} from './utils/calculations';
import { 
  isTaskDeadlineReached, 
  playDeadlineAlertChime 
} from './utils/deadlineAlert';
import { LoginView } from './components/LoginView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TasksView } from './components/TasksView';
import { WorkersView } from './components/WorkersView';
import { WorkerDetailModal } from './components/WorkerDetailModal';
import { EmailReportsView } from './components/EmailReportsView';
import { GoogleSheetsView } from './components/GoogleSheetsView';
import { TaskModal } from './components/TaskModal';
import { WorkerModal } from './components/WorkerModal';
import { DeadlineAlertBanner } from './components/DeadlineAlertBanner';
import confetti from 'canvas-confetti';

import { useTheme } from './context/ThemeContext';

export default function App() {
  const { isDark } = useTheme();
  // Local persistence states with fallback to STF Group initial presets
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem('syncrowork_workers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((w: Worker) => w.documentId === '1073524622' || w.name === 'JOSE GUZMAN')) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_WORKERS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('syncrowork_tasks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((t: Task) => t.workerName === 'JOSE GUZMAN')) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_TASKS;
  });

  const [emailConfigs, setEmailConfigs] = useState<EmailAutomationConfig[]>(() => {
    const saved = localStorage.getItem('syncrowork_email_configs');
    return saved ? JSON.parse(saved) : INITIAL_EMAIL_CONFIGS;
  });

  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(() => {
    const saved = localStorage.getItem('syncrowork_email_logs');
    return saved ? JSON.parse(saved) : INITIAL_EMAIL_LOGS;
  });

  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(() => {
    const saved = localStorage.getItem('syncrowork_sheets_config');
    return saved ? JSON.parse(saved) : INITIAL_SHEETS_CONFIG;
  });

  // Authenticated User State (Shows LoginView on first visit or until logged in as JOSE GUZMAN)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('syncrowork_current_user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        if (user && (user.documentId === '1073524622' || user.name === 'JOSE GUZMAN')) {
          return user;
        }
      } catch (e) {}
    }
    return null;
  });

  // UI state
  const [currentView, setCurrentView] = useState<'dashboard' | 'tasks' | 'workers' | 'emails' | 'sheets'>('dashboard');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Time & Deadline monitoring state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [dismissedAlertTaskIds, setDismissedAlertTaskIds] = useState<string[]>([]);
  const [lastNotifiedCount, setLastNotifiedCount] = useState<number>(0);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [initialWorkerForTask, setInitialWorkerForTask] = useState<string | undefined>(undefined);

  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [workerToEdit, setWorkerToEdit] = useState<Worker | null>(null);

  const [selectedWorkerForDetail, setSelectedWorkerForDetail] = useState<Worker | null>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('syncrowork_workers', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('syncrowork_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('syncrowork_email_configs', JSON.stringify(emailConfigs));
  }, [emailConfigs]);

  useEffect(() => {
    localStorage.setItem('syncrowork_email_logs', JSON.stringify(emailLogs));
  }, [emailLogs]);

  useEffect(() => {
    localStorage.setItem('syncrowork_sheets_config', JSON.stringify(sheetsConfig));
  }, [sheetsConfig]);

  // Periodic timer to detect deadline completions every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  // Compute all currently overdue tasks in real-time
  const overdueTasks = useMemo(() => {
    return tasks.filter((task) => isTaskDeadlineReached(task, currentTime));
  }, [tasks, currentTime]);

  // Play chime sound when overdue task count increases
  useEffect(() => {
    if (overdueTasks.length > lastNotifiedCount) {
      playDeadlineAlertChime();
    }
    setLastNotifiedCount(overdueTasks.length);
  }, [overdueTasks.length]);

  // Active banner alerts (overdue tasks that haven't been dismissed in current session)
  const activeBannerAlerts = useMemo(() => {
    return overdueTasks.filter((t) => !dismissedAlertTaskIds.includes(t.id));
  }, [overdueTasks, dismissedAlertTaskIds]);

  // Filter tasks based on global period & search query
  const filteredTasks = useMemo(() => {
    let list = filterTasksByTime(tasks, timeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.workerName.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tasks, timeFilter, searchQuery]);

  // Calculate metrics
  const performanceStats = useMemo(() => {
    return calculatePerformanceStats(filteredTasks);
  }, [filteredTasks]);

  const workerSummaries = useMemo(() => {
    return calculateWorkerMetrics(workers, tasks);
  }, [workers, tasks]);

  // Handlers for Tasks
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'>, taskId?: string) => {
    if (taskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                ...taskData,
              }
            : t
        )
      );
      setSyncToast('Tarea actualizada y sincronizada en Google Sheets.');
    } else {
      const newTask: Task = {
        ...taskData,
        id: `t-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setTasks((prev) => [newTask, ...prev]);
      setSyncToast('Nueva tarea programada y registrada en Google Sheets.');
    }

    setTimeout(() => setSyncToast(null), 3500);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setDismissedAlertTaskIds((prev) => prev.filter((id) => id !== taskId));
    setSyncToast('Tarea eliminada correctamente del registro.');
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isComplete = newStatus === 'completado';
          const actDelivery = isComplete ? (t.actualDeliveryDate || todayStr) : t.actualDeliveryDate;
          const actTime = isComplete ? (t.actualDeliveryTime || timeNow) : t.actualDeliveryTime;
          const actualH = isComplete && t.actualHours === 0 ? t.estimatedHours : t.actualHours;
          const eff = actualH > 0 && t.estimatedHours > 0 
            ? Math.round(((t.estimatedHours - actualH) / t.estimatedHours) * 1000) / 10 
            : t.efficiencyPercentage;

          return {
            ...t,
            status: newStatus,
            actualDeliveryDate: actDelivery,
            actualDeliveryTime: actTime,
            actualHours: actualH,
            efficiencyPercentage: eff,
          };
        }
        return t;
      })
    );

    if (newStatus === 'completado') {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      setSyncToast('¡Tarea completada con éxito y registrada!');
      setTimeout(() => setSyncToast(null), 3000);
    }
  };

  // Handlers for Workers
  const handleSaveWorker = (
    workerData: Omit<Worker, 'id' | 'initials' | 'avatarColor'>,
    workerId?: string
  ) => {
    const colors = [
      'bg-indigo-100 text-indigo-700 border-indigo-200',
      'bg-rose-100 text-rose-700 border-rose-200',
      'bg-amber-100 text-amber-700 border-amber-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200',
      'bg-cyan-100 text-cyan-700 border-cyan-200',
      'bg-purple-100 text-purple-700 border-purple-200',
    ];

    const initials = workerData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    if (workerId) {
      setWorkers((prev) =>
        prev.map((w) => (w.id === workerId ? { ...w, ...workerData, initials } : w))
      );
      setSyncToast('Perfil de trabajador actualizado en Google Sheets.');
    } else {
      const newWorker: Worker = {
        ...workerData,
        id: `w-${Date.now().toString().slice(-4)}`,
        initials,
        avatarColor: colors[workers.length % colors.length],
      };
      setWorkers((prev) => [...prev, newWorker]);
      setSyncToast('Nuevo trabajador añadido al equipo.');
    }

    setTimeout(() => setSyncToast(null), 3500);
  };

  const handleDeleteWorker = (workerId: string) => {
    setWorkers((prev) => prev.filter((w) => w.id !== workerId));
    if (selectedWorkerForDetail?.id === workerId) {
      setSelectedWorkerForDetail(null);
    }
    setSyncToast('Trabajador eliminado del equipo.');
    setTimeout(() => setSyncToast(null), 3000);
  };

  // Google Sheets Sync Action
  const handleSyncGoogleSheets = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setSheetsConfig((prev) => ({
        ...prev,
        lastSyncedAt: now,
        connected: true,
      }));
      setIsSyncing(false);
      setSyncToast(`Sincronización completa con Google Sheets (${tasks.length} tareas en 5 pestañas).`);
      setTimeout(() => setSyncToast(null), 4000);
    }, 1000);
  };

  // Email Automation Actions
  const handleToggleEmailConfig = (configId: string) => {
    setEmailConfigs((prev) =>
      prev.map((c) => (c.id === configId ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleDeleteEmailConfig = (configId: string) => {
    setEmailConfigs((prev) => prev.filter((c) => c.id !== configId));
    setSyncToast('Regla de correo eliminada.');
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handleAddEmailConfig = (configData: Omit<EmailAutomationConfig, 'id'>) => {
    const newConfig: EmailAutomationConfig = {
      ...configData,
      id: `auto-${Date.now().toString().slice(-4)}`,
    };
    setEmailConfigs((prev) => [...prev, newConfig]);
    setSyncToast('Automatización de correo configurada.');
    setTimeout(() => setSyncToast(null), 3000);
  };

  const handleSendInstantReport = (config: EmailAutomationConfig) => {
    const nowStr = new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog: EmailLog = {
      id: `log-${Date.now().toString().slice(-4)}`,
      sentAt: nowStr,
      recipients: config.recipients,
      frequency: config.name,
      subject: config.subjectTemplate.replace('{{date}}', nowStr),
      efficiencyReported: performanceStats.globalEfficiency,
      tasksCompletedCount: performanceStats.completedTasks,
      status: 'enviado',
    };
    setEmailLogs((prev) => [newLog, ...prev]);
  };

  const selectedWorkerSummary = workerSummaries.find(
    (ws) => ws.worker.id === selectedWorkerForDetail?.id
  );

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('syncrowork_current_user');
  };

  // If no user is logged in, show initial Welcome / Login screen (Face ID, PIN, ID, QR)
  if (!currentUser) {
    return (
      <LoginView
        workers={workers}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          localStorage.setItem('syncrowork_current_user', JSON.stringify(user));
        }}
      />
    );
  }

  return (
    <div className={`flex h-screen w-full font-sans overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#0B0F19] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      {/* Toast Notification Bar */}
      {syncToast && (
        <div className={`fixed top-4 right-4 z-50 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border flex items-center gap-2 animate-in fade-in slide-in-from-top-4 ${
          isDark ? 'bg-[#0F172A] text-white border-slate-700' : 'bg-white text-slate-900 border-slate-200 shadow-md'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{syncToast}</span>
        </div>
      )}

      {/* Deadline Alert Banner for overdue tasks */}
      <DeadlineAlertBanner
        alerts={activeBannerAlerts}
        onDismissAlert={(taskId) => setDismissedAlertTaskIds((prev) => [...prev, taskId])}
        onDismissAllAlerts={() => setDismissedAlertTaskIds(overdueTasks.map((t) => t.id))}
        onCompleteTask={(taskId) => handleUpdateTaskStatus(taskId, 'completado')}
        onEditTask={(task) => {
          setTaskToEdit(task);
          setIsTaskModalOpen(true);
        }}
        onDeleteTask={handleDeleteTask}
      />

      {/* Left Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        sheetsConfig={sheetsConfig}
        activeAutomationsCount={emailConfigs.filter((c) => c.isActive).length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentView={currentView}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenNewTaskModal={() => {
            setTaskToEdit(null);
            setInitialWorkerForTask(undefined);
            setIsTaskModalOpen(true);
          }}
          onOpenNewWorkerModal={() => {
            setWorkerToEdit(null);
            setIsWorkerModalOpen(true);
          }}
          onSyncGoogleSheets={handleSyncGoogleSheets}
          isSyncing={isSyncing}
          overdueTasks={overdueTasks}
          onCompleteTask={(taskId) => handleUpdateTaskStatus(taskId, 'completado')}
          onEditTask={(task) => {
            setTaskToEdit(task);
            setIsTaskModalOpen(true);
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* View Switcher */}
        <main className={`flex-1 overflow-y-auto transition-colors duration-300 ${isDark ? 'bg-[#0B0F19] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
          {currentView === 'dashboard' && (
            <DashboardView
              timeFilter={timeFilter}
              stats={performanceStats}
              workerSummaries={workerSummaries}
              recentTasks={filteredTasks}
              emailConfigs={emailConfigs}
              sheetsConfig={sheetsConfig}
              onNavigateToEmails={() => setCurrentView('emails')}
              onNavigateToSheets={() => setCurrentView('sheets')}
              onNavigateToWorkers={() => setCurrentView('workers')}
              onNavigateToTasks={() => setCurrentView('tasks')}
              onOpenNewTaskModal={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
              onSelectWorker={(worker) => setSelectedWorkerForDetail(worker)}
              onToggleEmailAutomation={handleToggleEmailConfig}
            />
          )}

          {currentView === 'tasks' && (
            <TasksView
              tasks={filteredTasks}
              workers={workers}
              timeFilter={timeFilter}
              onOpenNewTaskModal={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
              onEditTask={(task) => {
                setTaskToEdit(task);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
            />
          )}

          {currentView === 'workers' && (
            <WorkersView
              workers={workers}
              workerSummaries={workerSummaries}
              tasks={tasks}
              onOpenNewWorkerModal={() => {
                setWorkerToEdit(null);
                setIsWorkerModalOpen(true);
              }}
              onEditWorker={(worker) => {
                setWorkerToEdit(worker);
                setIsWorkerModalOpen(true);
              }}
              onDeleteWorker={handleDeleteWorker}
              onSelectWorker={(worker) => setSelectedWorkerForDetail(worker)}
              onOpenNewTaskModalForWorker={(workerId) => {
                setInitialWorkerForTask(workerId);
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
              onEditTask={(task) => {
                setTaskToEdit(task);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
            />
          )}

          {currentView === 'emails' && (
            <EmailReportsView
              configs={emailConfigs}
              logs={emailLogs}
              stats={performanceStats}
              workerSummaries={workerSummaries}
              tasks={filteredTasks}
              onToggleConfig={handleToggleEmailConfig}
              onAddConfig={handleAddEmailConfig}
              onDeleteConfig={handleDeleteEmailConfig}
              onSendInstantReport={handleSendInstantReport}
            />
          )}

          {currentView === 'sheets' && (
            <GoogleSheetsView
              sheetsConfig={sheetsConfig}
              tasks={tasks}
              workers={workers}
              workerSummaries={workerSummaries}
              stats={performanceStats}
              emailLogs={emailLogs}
              onUpdateSheetsConfig={setSheetsConfig}
              onSyncNow={handleSyncGoogleSheets}
              isSyncing={isSyncing}
              onDeleteTask={handleDeleteTask}
            />
          )}
        </main>
      </div>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        onDeleteTask={handleDeleteTask}
        taskToEdit={taskToEdit}
        workers={workers}
        initialWorkerId={initialWorkerForTask}
      />

      {/* Worker Create / Edit Modal */}
      <WorkerModal
        isOpen={isWorkerModalOpen}
        onClose={() => {
          setIsWorkerModalOpen(false);
          setWorkerToEdit(null);
        }}
        onSave={handleSaveWorker}
        onDeleteWorker={handleDeleteWorker}
        workerToEdit={workerToEdit}
      />

      {/* Worker Evaluation & Detail Modal */}
      <WorkerDetailModal
        worker={selectedWorkerForDetail}
        summary={selectedWorkerSummary}
        tasks={tasks}
        onClose={() => setSelectedWorkerForDetail(null)}
        onOpenNewTaskModalForWorker={(workerId) => {
          setSelectedWorkerForDetail(null);
          setTaskToEdit(null);
          setInitialWorkerForTask(workerId);
          setIsTaskModalOpen(true);
        }}
        onDeleteWorker={handleDeleteWorker}
        onDeleteTask={handleDeleteTask}
      />
    </div>
  );
}

