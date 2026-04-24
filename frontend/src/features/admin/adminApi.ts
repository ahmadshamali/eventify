import { apiRequest } from '../../lib/axiosClient'
import type {
  AdminEvent,
  AdminOverview,
  AdminUser,
  PendingOrganizer,
  RejectOrganizerPayload,
} from './admin.types'

export async function fetchAdminOverview(): Promise<AdminOverview> {
  return apiRequest<AdminOverview>('/admin/overview')
}

export async function fetchPendingOrganizers(): Promise<PendingOrganizer[]> {
  return apiRequest<PendingOrganizer[]>('/admin/pending-organizers')
}

export async function approvePendingOrganizer(organizerUserId: number): Promise<void> {
  await apiRequest<void>(`/admin/pending-organizers/${organizerUserId}/approve`, {
    method: 'POST',
  })
}

export async function rejectPendingOrganizer(
  organizerUserId: number,
  payload: RejectOrganizerPayload,
): Promise<void> {
  await apiRequest<void>(`/admin/pending-organizers/${organizerUserId}/reject`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  return apiRequest<AdminUser[]>('/admin/users')
}

export async function fetchAdminEvents(): Promise<AdminEvent[]> {
  return apiRequest<AdminEvent[]>('/admin/events')
}
