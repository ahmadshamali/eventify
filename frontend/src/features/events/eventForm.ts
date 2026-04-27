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
  durationMinutes: z.coerce.number().int().positive({ message: 'Duration must be a positive number' }),
  imageUrl: z.string().url({ message: 'Image URL must be a valid URL' }).optional().or(z.literal('')),
  eventLink: z.string().url({ message: 'Event link must be a valid URL' }).optional().or(z.literal('')),
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
  durationMinutes: 60,
  imageUrl: '',
  eventLink: '',
  location: '',
  category: 'Technology',
  capacity: 1,
}

export const mapEventToFormValues = (event: Event): EventFormInput => {
  const eventDate = new Date(event.startDateTime)
  const eventEndDate = new Date(event.endDateTime)
  const durationMinutes = Math.max(1, Math.round((eventEndDate.getTime() - eventDate.getTime()) / 60000))

  return {
    title: event.title,
    description: event.description ?? '',
    date: `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`,
    time: `${String(eventDate.getHours()).padStart(2, '0')}:${String(eventDate.getMinutes()).padStart(2, '0')}`,
    durationMinutes,
    imageUrl: event.imageUrl ?? '',
    eventLink: event.eventLink ?? '',
    location: event.location,
    category: event.category,
    capacity: event.capacity,
  }
}

export const buildEventPayload = (data: EventFormValues): CreateEventPayload => ({
  title: data.title.trim(),
  description: data.description.trim(),
  startDateTime: new Date(`${data.date}T${data.time}:00`).toISOString(),
  durationMinutes: data.durationMinutes,
  imageUrl: data.imageUrl?.trim() ? data.imageUrl.trim() : null,
  eventLink: data.eventLink?.trim() ? data.eventLink.trim() : null,
  location: data.location.trim(),
  category: data.category,
  capacity: data.capacity,
})