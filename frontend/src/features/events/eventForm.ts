import * as z from 'zod'

import type { CreateEventPayload, Event } from './event.types'

export const eventCategories = [
  'Technology',
  'Business & Entrepreneurship',
  'Education & Workshops',
  'Sports & Fitness',
  'Arts & Culture',
] as const

export const eventFormSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }).max(100, { message: 'Title must be at most 100 characters' }),
  description: z.string().min(1, { message: 'Description is required' }).max(1000, { message: 'Description must be at most 1000 characters' }),
  date: z.string().min(1, { message: 'Date is required' }),
  time: z.string().min(1, { message: 'Time is required' }),
  location: z.string().min(1, { message: 'Location is required' }).max(255, { message: 'Location must be at most 255 characters' }),
  category: z.enum(eventCategories),
  capacity: z.coerce.number().int().positive({ message: 'Capacity must be a positive number' }),
})

export type EventFormInput = z.input<typeof eventFormSchema>
export type EventFormValues = z.output<typeof eventFormSchema>

export const defaultEventFormValues: EventFormInput = {
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  category: 'Technology',
  capacity: 1,
}

export const mapEventToFormValues = (event: Event): EventFormInput => {
  const eventDate = new Date(event.startDateTime)

  return {
    title: event.title,
    description: event.description ?? '',
    date: `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`,
    time: `${String(eventDate.getHours()).padStart(2, '0')}:${String(eventDate.getMinutes()).padStart(2, '0')}`,
    location: event.location,
    category: event.category,
    capacity: event.capacity,
  }
}

export const buildEventPayload = (data: EventFormValues): CreateEventPayload => ({
  title: data.title.trim(),
  description: data.description.trim(),
  startDateTime: new Date(`${data.date}T${data.time}:00`).toISOString(),
  location: data.location.trim(),
  category: data.category,
  capacity: data.capacity,
})