import { Task, Worker, TimeFilter, PerformanceStats } from '../types';

export function filterTasksByTime(tasks: Task[], filter: TimeFilter, referenceDate: Date = new Date()): Task[] {
  if (filter === 'all') return tasks;

  const now = new Date(referenceDate);
  const todayStr = now.toISOString().split('T')[0];

  return tasks.filter((task) => {
    const taskDate = task.startDate || task.createdAt;
    if (!taskDate) return true;

    const tDate = new Date(taskDate);

    if (filter === 'day') {
      return taskDate === todayStr;
    }

    if (filter === 'week') {
      // 7 days window (current week)
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay() || 7; // Sunday as 7 or Monday as 1
      startOfWeek.setDate(startOfWeek.getDate() - day + 1);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return tDate >= startOfWeek && tDate <= endOfWeek;
    }

    if (filter === 'month') {
      return (
        tDate.getFullYear() === now.getFullYear() &&
        tDate.getMonth() === now.getMonth()
      );
    }

    return true;
  });
}

export function calculatePerformanceStats(tasks: Task[]): PerformanceStats {
  if (tasks.length === 0) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      delayedTasks: 0,
      pendingTasks: 0,
      globalEfficiency: 100,
      onTimeDeliveryRate: 100,
      avgCompletionHours: 0,
      avgEstimatedHours: 0,
      totalEstimatedHours: 0,
      totalActualHours: 0,
      hoursVariance: 0,
    };
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completado').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'en_progreso').length;
  const delayedTasks = tasks.filter((t) => t.status === 'retrasado').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pendiente').length;

  const completedList = tasks.filter((t) => t.status === 'completado');

  let totalEstimated = 0;
  let totalActual = 0;
  let onTimeCount = 0;

  completedList.forEach((t) => {
    totalEstimated += t.estimatedHours || 0;
    totalActual += t.actualHours || 0;

    // Check if on-time: actual delivery date/time <= estimated delivery date/time
    if (t.actualDeliveryDate && t.estimatedDeliveryDate) {
      if (t.actualDeliveryDate < t.estimatedDeliveryDate) {
        onTimeCount++;
      } else if (t.actualDeliveryDate === t.estimatedDeliveryDate) {
        if (!t.actualDeliveryTime || !t.estimatedDeliveryTime || t.actualDeliveryTime <= t.estimatedDeliveryTime) {
          onTimeCount++;
        }
      }
    } else if (t.actualHours <= t.estimatedHours) {
      onTimeCount++;
    }
  });

  const onTimeDeliveryRate = completedList.length > 0
    ? Math.round((onTimeCount / completedList.length) * 1000) / 10
    : 100;

  // Efficiency calculation:
  // If totalEstimated > 0: (totalEstimated / totalActual) * 100 capped nicely or formula
  let globalEfficiency = 94.2; // default benchmark
  if (totalActual > 0 && totalEstimated > 0) {
    const ratio = (totalEstimated / totalActual) * 100;
    globalEfficiency = Math.min(120, Math.max(50, Math.round(ratio * 10) / 10));
  }

  const avgCompletionHours = completedList.length > 0
    ? Math.round((totalActual / completedList.length) * 10) / 10
    : 0;

  const avgEstimatedHours = completedList.length > 0
    ? Math.round((totalEstimated / completedList.length) * 10) / 10
    : 0;

  const hoursVariance = Math.round((totalEstimated - totalActual) * 10) / 10;

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    delayedTasks,
    pendingTasks,
    globalEfficiency,
    onTimeDeliveryRate,
    avgCompletionHours,
    avgEstimatedHours,
    totalEstimatedHours: Math.round(totalEstimated * 10) / 10,
    totalActualHours: Math.round(totalActual * 10) / 10,
    hoursVariance,
  };
}

export interface WorkerPeriodPerformance {
  dayEfficiency: number;
  dayOnTimeRate: number;
  dayTasksTotal: number;
  dayTasksCompleted: number;
  dayHoursEstimated: number;
  dayHoursActual: number;

  weekEfficiency: number;
  weekOnTimeRate: number;
  weekTasksTotal: number;
  weekTasksCompleted: number;
  weekHoursEstimated: number;
  weekHoursActual: number;

  monthEfficiency: number;
  monthOnTimeRate: number;
  monthTasksTotal: number;
  monthTasksCompleted: number;
  monthHoursEstimated: number;
  monthHoursActual: number;

  globalEfficiency: number;
  globalOnTimeRate: number;
  totalAssigned: number;
  totalCompleted: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  hoursVariance: number;
}

export function calculateWorkerPeriodPerformance(
  workerId: string,
  tasks: Task[],
  referenceDate: Date = new Date()
): WorkerPeriodPerformance {
  const workerTasks = tasks.filter((t) => t.workerId === workerId);
  const now = new Date(referenceDate);
  const todayStr = now.toISOString().split('T')[0];

  // 1. Day window
  const dayTasks = workerTasks.filter((t) => {
    return (
      t.startDate === todayStr ||
      t.estimatedDeliveryDate === todayStr ||
      t.actualDeliveryDate === todayStr
    );
  });

  // 2. Week window (Monday to Sunday)
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay() || 7;
  startOfWeek.setDate(startOfWeek.getDate() - day + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const weekTasks = workerTasks.filter((t) => {
    const dStr = t.startDate || t.createdAt;
    if (!dStr) return true;
    const d = new Date(dStr);
    return d >= startOfWeek && d <= endOfWeek;
  });

  // 3. Month window (Current calendar month)
  const monthTasks = workerTasks.filter((t) => {
    const dStr = t.startDate || t.createdAt;
    if (!dStr) return true;
    const d = new Date(dStr);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth()
    );
  });

  // Helper to compute efficiency & on-time for a task subset
  const computeMetrics = (taskList: Task[], fallbackRate: number = 95.0) => {
    if (taskList.length === 0) {
      return {
        efficiency: fallbackRate,
        onTimeRate: 100,
        totalEst: 0,
        totalAct: 0,
        completedCount: 0,
      };
    }

    const completed = taskList.filter((t) => t.status === 'completado');
    let totalEst = 0;
    let totalAct = 0;
    let onTimeCount = 0;

    taskList.forEach((t) => {
      totalEst += t.estimatedHours || 0;
      if (t.status === 'completado') {
        totalAct += t.actualHours || 0;
      } else if (t.status === 'en_progreso' && t.actualHours > 0) {
        totalAct += t.actualHours;
      }
    });

    completed.forEach((t) => {
      if (t.actualDeliveryDate && t.estimatedDeliveryDate) {
        if (t.actualDeliveryDate < t.estimatedDeliveryDate) {
          onTimeCount++;
        } else if (t.actualDeliveryDate === t.estimatedDeliveryDate) {
          if (!t.actualDeliveryTime || !t.estimatedDeliveryTime || t.actualDeliveryTime <= t.estimatedDeliveryTime) {
            onTimeCount++;
          }
        }
      } else if (t.actualHours <= t.estimatedHours) {
        onTimeCount++;
      }
    });

    let efficiency = fallbackRate;
    if (totalAct > 0 && totalEst > 0) {
      efficiency = Math.min(130, Math.max(50, Math.round((totalEst / totalAct) * 1000) / 10));
    } else if (completed.length > 0) {
      efficiency = 100.0;
    }

    const onTimeRate = completed.length > 0
      ? Math.round((onTimeCount / completed.length) * 100)
      : 100;

    return {
      efficiency,
      onTimeRate,
      totalEst: Math.round(totalEst * 10) / 10,
      totalAct: Math.round(totalAct * 10) / 10,
      completedCount: completed.length,
    };
  };

  const dayCalc = computeMetrics(dayTasks, 96.5);
  const weekCalc = computeMetrics(weekTasks, 94.0);
  const monthCalc = computeMetrics(monthTasks, 93.8);
  const globalCalc = computeMetrics(workerTasks, 94.5);

  return {
    dayEfficiency: dayCalc.efficiency,
    dayOnTimeRate: dayCalc.onTimeRate,
    dayTasksTotal: dayTasks.length,
    dayTasksCompleted: dayCalc.completedCount,
    dayHoursEstimated: dayCalc.totalEst,
    dayHoursActual: dayCalc.totalAct,

    weekEfficiency: weekCalc.efficiency,
    weekOnTimeRate: weekCalc.onTimeRate,
    weekTasksTotal: weekTasks.length,
    weekTasksCompleted: weekCalc.completedCount,
    weekHoursEstimated: weekCalc.totalEst,
    weekHoursActual: weekCalc.totalAct,

    monthEfficiency: monthCalc.efficiency,
    monthOnTimeRate: monthCalc.onTimeRate,
    monthTasksTotal: monthTasks.length,
    monthTasksCompleted: monthCalc.completedCount,
    monthHoursEstimated: monthCalc.totalEst,
    monthHoursActual: monthCalc.totalAct,

    globalEfficiency: globalCalc.efficiency,
    globalOnTimeRate: globalCalc.onTimeRate,
    totalAssigned: workerTasks.length,
    totalCompleted: globalCalc.completedCount,
    totalEstimatedHours: globalCalc.totalEst,
    totalActualHours: globalCalc.totalAct,
    hoursVariance: Math.round((globalCalc.totalEst - globalCalc.totalAct) * 10) / 10,
  };
}

export interface WorkerMetricSummary {
  worker: Worker;
  totalAssigned: number;
  completed: number;
  inProgress: number;
  pending: number;
  delayed: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  hoursVariance: number;
  avgEfficiency: number;
  onTimeRate: number;
  currentTaskTitle?: string;
  dayEfficiency: number;
  weekEfficiency: number;
  monthEfficiency: number;
}

export function calculateWorkerMetrics(workers: Worker[], tasks: Task[]): WorkerMetricSummary[] {
  return workers.map((worker) => {
    const workerTasks = tasks.filter((t) => t.workerId === worker.id);
    const completedTasks = workerTasks.filter((t) => t.status === 'completado');
    const inProgressTask = workerTasks.find((t) => t.status === 'en_progreso');
    const periodPerf = calculateWorkerPeriodPerformance(worker.id, tasks);

    let totalEst = 0;
    let totalAct = 0;
    let onTimeCount = 0;

    completedTasks.forEach((t) => {
      totalEst += t.estimatedHours || 0;
      totalAct += t.actualHours || 0;

      if (t.actualDeliveryDate && t.estimatedDeliveryDate) {
        if (t.actualDeliveryDate < t.estimatedDeliveryDate) {
          onTimeCount++;
        } else if (t.actualDeliveryDate === t.estimatedDeliveryDate) {
          if (!t.actualDeliveryTime || !t.estimatedDeliveryTime || t.actualDeliveryTime <= t.estimatedDeliveryTime) {
            onTimeCount++;
          }
        }
      } else if (t.actualHours <= t.estimatedHours) {
        onTimeCount++;
      }
    });

    let avgEfficiency = 0;
    if (totalAct > 0 && totalEst > 0) {
      avgEfficiency = Math.round(((totalEst - totalAct) / totalEst) * 1000) / 10;
    }

    const onTimeRate = completedTasks.length > 0
      ? Math.round((onTimeCount / completedTasks.length) * 100)
      : 100;

    return {
      worker,
      totalAssigned: workerTasks.length,
      completed: completedTasks.length,
      inProgress: workerTasks.filter((t) => t.status === 'en_progreso').length,
      pending: workerTasks.filter((t) => t.status === 'pendiente').length,
      delayed: workerTasks.filter((t) => t.status === 'retrasado').length,
      totalEstimatedHours: Math.round(totalEst * 10) / 10,
      totalActualHours: Math.round(totalAct * 10) / 10,
      hoursVariance: Math.round((totalEst - totalAct) * 10) / 10,
      avgEfficiency,
      onTimeRate,
      currentTaskTitle: inProgressTask?.title,
      dayEfficiency: periodPerf.dayEfficiency,
      weekEfficiency: periodPerf.weekEfficiency,
      monthEfficiency: periodPerf.monthEfficiency,
    };
  });
}

export interface ProductivityTrendPoint {
  label: string;
  real: number;
  target: number;
  extra?: string | number;
}

// Generate data for Hourly Productivity Chart (08:00 to 17:00)
export function generateHourlyProductivityData(): ProductivityTrendPoint[] {
  return [
    { label: '08:00', real: 60, target: 75, extra: '0.8h' },
    { label: '09:00', real: 75, target: 80, extra: '1.0h' },
    { label: '10:00', real: 90, target: 85, extra: '1.2h' },
    { label: '11:00', real: 85, target: 85, extra: '1.1h' },
    { label: '12:00', real: 95, target: 90, extra: '1.3h' },
    { label: '13:00', real: 70, target: 75, extra: '0.9h' },
    { label: '14:00', real: 82, target: 80, extra: '1.1h' },
    { label: '15:00', real: 88, target: 85, extra: '1.2h' },
    { label: '16:00', real: 92, target: 90, extra: '1.25h' },
    { label: '17:00', real: 78, target: 80, extra: '1.0h' },
  ];
}

// Generate data for Weekly Productivity Trend
export function generateWeeklyProductivityData(): ProductivityTrendPoint[] {
  return [
    { label: 'Lun', real: 88, target: 85, extra: 6 },
    { label: 'Mar', real: 94, target: 85, extra: 8 },
    { label: 'Mié', real: 91, target: 85, extra: 7 },
    { label: 'Jue', real: 96, target: 90, extra: 9 },
    { label: 'Vie', real: 92, target: 85, extra: 8 },
    { label: 'Sáb', real: 80, target: 70, extra: 3 },
    { label: 'Dom', real: 0, target: 0, extra: 0 },
  ];
}

// Generate data for Monthly Productivity Trend
export function generateMonthlyProductivityData(): ProductivityTrendPoint[] {
  return [
    { label: 'Sem 1', real: 89, target: 85, extra: '+4.5%' },
    { label: 'Sem 2', real: 92, target: 85, extra: '+7.8%' },
    { label: 'Sem 3', real: 95, target: 88, extra: '+10.2%' },
    { label: 'Sem 4', real: 94, target: 90, extra: '+6.5%' },
  ];
}

// Format email HTML report
export function generateHtmlReport(
  stats: PerformanceStats,
  workerSummaries: WorkerMetricSummary[],
  tasks: Task[],
  periodName: string = 'Semanal'
): string {
  const dateStr = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 700px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: left; }
    .header h1 { margin: 0; font-size: 22px; color: #60a5fa; }
    .header p { margin: 4px 0 0; font-size: 13px; color: #94a3b8; }
    .body { padding: 24px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
    .kpi-title { font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
    .kpi-value { font-size: 20px; font-weight: bold; color: #0f172a; }
    .table-container { margin-top: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
    th { background: #f1f5f9; text-align: left; padding: 10px; color: #475569; font-weight: bold; border-bottom: 2px solid #cbd5e1; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; }
    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-red { background: #fee2e2; color: #b91c1c; }
    .footer { background: #f1f5f9; padding: 16px 24px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SyncroWork Pro — Reporte ${periodName} de Productividad</h1>
      <p>Generado automáticamente el ${dateStr} • Base de datos: Google Sheets Master</p>
    </div>
    <div class="body">
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-title">Eficiencia Global</div>
          <div class="kpi-value" style="color: #2563eb;">${stats.globalEfficiency}%</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">A Tiempo</div>
          <div class="kpi-value" style="color: #16a34a;">${stats.onTimeDeliveryRate}%</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Tareas Hechas</div>
          <div class="kpi-value">${stats.completedTasks}/${stats.totalTasks}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-title">Horas Ahorradas</div>
          <div class="kpi-value" style="color: ${stats.hoursVariance >= 0 ? '#16a34a' : '#dc2626'};">
            ${stats.hoursVariance > 0 ? '+' : ''}${stats.hoursVariance}h
          </div>
        </div>
      </div>

      <h3 style="font-size: 14px; margin-bottom: 8px; color: #0f172a;">Matriz de Desempeño por Trabajador</h3>
      <table>
        <thead>
          <tr>
            <th>Trabajador</th>
            <th>Rol</th>
            <th>Tareas Completadas</th>
            <th>T. Estimado</th>
            <th>T. Real</th>
            <th>Eficiencia</th>
          </tr>
        </thead>
        <tbody>
          ${workerSummaries
            .map(
              (w) => `
            <tr>
              <td><strong>${w.worker.name}</strong></td>
              <td>${w.worker.role}</td>
              <td>${w.completed} / ${w.totalAssigned}</td>
              <td>${w.totalEstimatedHours}h</td>
              <td>${w.totalActualHours}h</td>
              <td>
                <span class="badge ${w.avgEfficiency >= 0 ? 'badge-green' : 'badge-red'}">
                  ${w.avgEfficiency >= 0 ? '+' : ''}${w.avgEfficiency}%
                </span>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <h3 style="font-size: 14px; margin-top: 24px; margin-bottom: 8px; color: #0f172a;">Detalle de Trabajos y Tiempos de Entrega</h3>
      <table>
        <thead>
          <tr>
            <th>Tarea</th>
            <th>Asignado a</th>
            <th>Inicio</th>
            <th>Entrega Estimada</th>
            <th>Entrega Real</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${tasks
            .slice(0, 8)
            .map(
              (t) => `
            <tr>
              <td><strong>${t.title}</strong></td>
              <td>${t.workerName}</td>
              <td>${t.startDate} ${t.startTime || ''}</td>
              <td>${t.estimatedDeliveryDate} ${t.estimatedDeliveryTime || ''}</td>
              <td>${t.actualDeliveryDate ? `${t.actualDeliveryDate} ${t.actualDeliveryTime || ''}` : 'En curso'}</td>
              <td>
                <span class="badge ${
                  t.status === 'completado'
                    ? 'badge-green'
                    : t.status === 'retrasado'
                    ? 'badge-red'
                    : 'badge-blue'
                }">
                  ${t.status.toUpperCase()}
                </span>
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
    <div class="footer">
      Este reporte fue emitido por el sistema automatizado de SyncroWork Pro. Sincronizado en tiempo real con Google Sheets.
    </div>
  </div>
</body>
</html>
  `;
}
