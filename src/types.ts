export type TimeFilter = 'day' | 'week' | 'month' | 'all';

export type TaskStatus = 'pendiente' | 'en_progreso' | 'completado' | 'retrasado';
export type TaskPriority = 'baja' | 'media' | 'alta' | 'urgente';

export interface Worker {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatarColor: string;
  initials: string;
  phone?: string;
  status: 'activo' | 'vacaciones' | 'inactivo';
  joinDate: string;
  documentId?: string;
  pinCode?: string;
  avatarUrl?: string;
  faceEnrolled?: boolean;
  biometricDescriptor?: any;
  biometricSignature?: string;
  isLiveEnrolled?: boolean;
}

export interface EnrolledFaceProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  documentId: string;
  pinCode: string;
  enrolledAt: string;
  photoDataUrl: string;
  biometricSignature: string;
  biometricVector?: number[];
  biometricDescriptor?: any;
  confidenceThreshold: number;
  isLiveEnrolled?: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  avatarColor: string;
  initials: string;
  authMethod: 'facial' | 'pin' | 'document' | 'qr' | 'admin';
  documentId?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  workerId: string;
  workerName: string;
  category: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string; // ISO date or YYYY-MM-DD
  startTime?: string; // HH:mm
  estimatedDeliveryDate: string;
  estimatedDeliveryTime?: string;
  actualDeliveryDate?: string;
  actualDeliveryTime?: string;
  estimatedHours: number;
  actualHours: number;
  efficiencyPercentage: number; // calculated: ((estimatedHours - actualHours) / estimatedHours) * 100 or ratio
  notes?: string;
  tags: string[];
  createdAt: string;
}

export interface EmailAutomationConfig {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  timeOfDay: string; // "18:00"
  dayOfWeek?: number; // 1 = Monday
  dayOfMonth?: number; // 1 = 1st of month
  recipients: string[];
  subjectTemplate: string;
  includeMetrics: boolean;
  includeWorkerMatrix: boolean;
  includePendingTasks: boolean;
  isActive: boolean;
  lastSentDate?: string;
}

export interface EmailLog {
  id: string;
  sentAt: string;
  recipients: string[];
  frequency: string;
  subject: string;
  efficiencyReported: number;
  tasksCompletedCount: number;
  status: 'enviado' | 'fallido';
}

export interface SheetTabDefinition {
  id: string;
  name: string;
  title: string;
  description: string;
  columns: string[];
}

export interface GoogleSheetsConfig {
  spreadsheetUrl: string;
  spreadsheetName: string;
  connected: boolean;
  autoSync: boolean;
  syncIntervalMinutes: number;
  lastSyncedAt?: string;
  webhookUrl?: string;
}

export interface PerformanceStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  delayedTasks: number;
  pendingTasks: number;
  globalEfficiency: number; // percentage
  onTimeDeliveryRate: number; // percentage
  avgCompletionHours: number;
  avgEstimatedHours: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  hoursVariance: number; // positive = saved time, negative = exceeded time
}
