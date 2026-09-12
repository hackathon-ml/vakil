import type { ServiceConnectionStatus, TicketStatus } from '../types';

export function formatRelativeTime(iso: string): string {
  const delta = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(delta / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function ticketStatusLabel(status: TicketStatus): string {
  if (status === 'in_progress') return 'In progress';
  if (status === 'waiting_response') return 'Waiting';
  return 'Completed';
}

export function connectionLabel(status: ServiceConnectionStatus): string {
  if (status === 'connected') return 'Connected';
  if (status === 'needs_2fa') return 'Needs 2FA';
  return 'Not linked';
}
