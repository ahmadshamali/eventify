import { apiRequest } from '../../lib/axiosClient'

export type FeedbackRead = {
  id: number
  rating: number
  comment: string | null
  created_at: string
  full_name: string
}

type FeedbackCreate = {
  rating: number
  comment?: string
}

export const submitFeedback = async (eventId: number, registrationId: number, payload: FeedbackCreate) => {
  return apiRequest<FeedbackRead>(`/events/${eventId}/registrations/${registrationId}/feedback`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const getFeedbackForRegistration = async (eventId: number, registrationId: number) => {
  return apiRequest<FeedbackRead>(`/events/${eventId}/registrations/${registrationId}/feedback`)
}

export const fetchFeedbacks = async (eventId: number) => {
  return apiRequest<FeedbackRead[]>(`/events/${eventId}/feedbacks`)
}
