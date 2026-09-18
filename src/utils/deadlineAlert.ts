import { Task } from '../types';

/**
 * Checks if a task has reached or passed its estimated delivery deadline.
 * Returns true only if task is NOT completed and the current time is >= estimated deadline.
 */
export function isTaskDeadlineReached(task: Task, now: Date = new Date()): boolean {
  if (task.status === 'completado') return false;
  if (!task.estimatedDeliveryDate) return false;

  const timeStr = task.estimatedDeliveryTime ? task.estimatedDeliveryTime : '23:59';
  const deadlineStr = `${task.estimatedDeliveryDate}T${timeStr}:00`;
  const deadline = new Date(deadlineStr);

  if (isNaN(deadline.getTime())) {
    // fallback if date format is slightly different
    const [year, month, day] = task.estimatedDeliveryDate.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const fallbackDeadline = new Date(year, (month || 1) - 1, day || 1, hours || 23, minutes || 59);
    return now.getTime() >= fallbackDeadline.getTime();
  }

  return now.getTime() >= deadline.getTime();
}

/**
 * Formats a human-readable message of how long ago the deadline was reached
 */
export function getOverdueDurationText(task: Task, now: Date = new Date()): string {
  if (!task.estimatedDeliveryDate) return 'Plazo vencido';

  const timeStr = task.estimatedDeliveryTime ? task.estimatedDeliveryTime : '23:59';
  const deadlineStr = `${task.estimatedDeliveryDate}T${timeStr}:00`;
  const deadline = new Date(deadlineStr);

  if (isNaN(deadline.getTime())) {
    return 'Plazo cumplido';
  }

  const diffMs = now.getTime() - deadline.getTime();
  if (diffMs <= 0) return 'Plazo por cumplirse';

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `Cumplido hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  }
  if (diffHours > 0) {
    return `Cumplido hace ${diffHours} h ${diffMinutes % 60} min`;
  }
  if (diffMinutes > 0) {
    return `Cumplido hace ${diffMinutes} min`;
  }
  return 'Plazo cumplido en este momento';
}

/**
 * Audio chime using Web Audio API (no external sound files required)
 */
export function playDeadlineAlertChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    
    // Play two-tone alert chime (E5 -> A5)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
    gain1.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.25);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, audioCtx.currentTime + 0.22); // A5
    gain2.gain.setValueAtTime(0.25, audioCtx.currentTime + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.65);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(audioCtx.currentTime + 0.22);
    osc2.stop(audioCtx.currentTime + 0.65);
  } catch {
    // Browser audio policy may prevent unprompted audio; safely catch
  }
}
