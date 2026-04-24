import { apiRequest } from '../../lib/axiosClient'
import type {
  CancelEventPayload,
  CreateEventPayload,
  Event,
  Registration,
  UpdateEventPayload,
} from './event.types'

export const fetchEvents = async (): Promise<Event[]> => {
  return apiRequest<Event[]>('/events/')
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