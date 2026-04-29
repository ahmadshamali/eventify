import { apiRequest } from '../../lib/axiosClient'
import type {
  CancelEventPayload,
  CreateEventPayload,
  Event,
  Registration,
  RegistrationStatus,
  StudentRegistrationEvent,
  UpdateEventPayload,
} from './event.types'

type GenerateDescriptionPayload = {
  title: string
  category: string
  additional_details?: string
}

type GenerateDescriptionResponse = {
  description: string
}

export const fetchEvents = async (options?: { includeCompleted?: boolean }): Promise<Event[]> => {
  const qs = options?.includeCompleted ? '?include_completed=true' : ''
  return apiRequest<Event[]>(`/events/${qs}`)
}

export const createEvent = async (payload: CreateEventPayload): Promise<Event> => {
  return apiRequest<Event>('/events/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const updateEvent = async (eventId: number, payload: UpdateEventPayload): Promise<Event> => {
  return apiRequest<Event>(`/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export const cancelEvent = async (eventId: number, payload: CancelEventPayload): Promise<Event> => {
  return apiRequest<Event>(`/events/${eventId}/cancel`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const registerForEvent = async (eventId: number): Promise<Registration> => {
  return apiRequest<Registration>(`/events/${eventId}/register`, {
    method: 'POST',
  })
}

export const unregisterFromEvent = async (eventId: number): Promise<void> => {
  await apiRequest<void>(`/events/${eventId}/register`, {
    method: 'DELETE',
  })
}

export const fetchRegistrationStatus = async (eventId: number): Promise<RegistrationStatus> => {
  return apiRequest<RegistrationStatus>(`/events/${eventId}/registration-status`)
}

export const fetchMyRegistrations = async (): Promise<StudentRegistrationEvent[]> => {
  return apiRequest<StudentRegistrationEvent[]>('/events/my-registrations')
}

export const generateEventDescription = async (
  payload: GenerateDescriptionPayload,
): Promise<GenerateDescriptionResponse> => {
  return apiRequest<GenerateDescriptionResponse>('/ai/generate-event-description', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}