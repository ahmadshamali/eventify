import type { Event } from './event.types'

export type EventLifecycleStatus = 'Upcoming' | 'Completed'

export function getEventLifecycleStatus(event: Pick<Event, 'endDateTime'>): EventLifecycleStatus {
  return new Date(event.endDateTime).getTime() <= Date.now() ? 'Completed' : 'Upcoming'
}

export function formatEventEndTime(endDateTime: string): string {
  return new Date(endDateTime).toLocaleString()
}

export function formatEventStartTime(startDateTime: string): string {
  return new Date(startDateTime).toLocaleString([], {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}