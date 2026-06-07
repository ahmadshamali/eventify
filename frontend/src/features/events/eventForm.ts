import * as z from 'zod'

import type { CreateEventPayload, Event } from './event.types'

const isAbsoluteOrRelativeUploadPath = (value: string) => {
  if (/^(https?:)?\/\//i.test(value)) {
    return true
  }

  return value.startsWith('/')
}

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
  endDate: z.string().min(1, { message: 'End date is required' }),
  endTime: z.string().min(1, { message: 'End time is required' }),
  imageUrl: z.string().refine(isAbsoluteOrRelativeUploadPath, { message: 'Image URL must be a valid URL or upload path' }).optional().or(z.literal('')),
  eventLink: z.string().url({ message: 'Event link must be a valid URL' }).optional().or(z.literal('')),
  location: z.string().min(1, { message: 'Location is required' }).max(255, { message: 'Location must be at most 255 characters' }),
  category: z.enum(eventCategories),
  capacity: z.coerce.number().int().positive({ message: 'Capacity must be a positive number' }),
}).superRefine((value, context) => {
  const startDateTime = new Date(`${value.date}T${value.time}:00`)
  const endDateTime = new Date(`${value.endDate}T${value.endTime}:00`)

  if (!Number.isNaN(startDateTime.getTime()) && !Number.isNaN(endDateTime.getTime()) && endDateTime <= startDateTime) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endTime'],
      message: 'End date and time must be after the start date and time',
    })
  }
})

export type EventFormInput = z.input<typeof eventFormSchema>
export type EventFormValues = z.output<typeof eventFormSchema>

export const defaultEventFormValues: EventFormInput = {
  title: '',
  description: '',
  date: '',
  time: '',
  endDate: '',
  endTime: '',
  imageUrl: '',
  eventLink: '',
  location: '',
  category: 'Technology',
  capacity: 1,
}

const formatDateInputValue = (value: Date) => {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

const formatTimeInputValue = (value: Date) => {
  return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`
}

export const mapEventToFormValues = (event: Event): EventFormInput => {
  const eventDate = new Date(event.startDateTime)
  const eventEndDate = new Date(event.endDateTime)

  return {
    title: event.title,
    description: event.description ?? '',
    date: formatDateInputValue(eventDate),
    time: formatTimeInputValue(eventDate),
    endDate: formatDateInputValue(eventEndDate),
    endTime: formatTimeInputValue(eventEndDate),
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
  startDateTime: `${data.date}T${data.time}:00`,
  endDateTime: `${data.endDate}T${data.endTime}:00`,
  imageUrl: data.imageUrl?.trim() ? data.imageUrl.trim() : null,
  eventLink: data.eventLink?.trim() ? data.eventLink.trim() : null,
  location: data.location.trim(),
  category: data.category,
  capacity: data.capacity,
})