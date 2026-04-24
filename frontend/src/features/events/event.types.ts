export interface Event {
  id: number;
  title: string;
  description: string | null;
  startDateTime: string;
  location: string;
  category: EventCategory;
  status: EventStatus;
  capacity: number;
  organizerId: number | null;
  created_at: string;
}

export type EventCategory =
  | 'Technology'
  | 'Business & Entrepreneurship'
  | 'Education & Workshops'
  | 'Sports & Fitness'
  | 'Arts & Culture'

export type EventStatus = 'Available' | 'Full' | 'Canceled'

export interface CreateEventPayload{
  title: string;
  description: string;
  startDateTime: string;
  location: string;
  category: EventCategory;
  capacity: number;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  startDateTime?: string;
  location?: string;
  category?: EventCategory;
  capacity?: number;
}

export interface CancelEventPayload {
  confirm: boolean;
}

export interface Registration {
  id: number;
  event_id: number;
  student_id: number;
  created_at: string;
}

export interface RegistrationStatus {
  event_id: number;
  is_registered: boolean;
  registered_count: number;
  capacity: number;
  available_seats: number;
}

export interface StudentRegistrationEvent {
  registration_id: number;
  registered_at: string;
  event_id: number;
  title: string;
  description: string | null;
  start_datetime: string;
  location: string;
  category: string;
  status: string;
  capacity: number;
}