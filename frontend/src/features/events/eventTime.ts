import type { Event } from './event.types'

export type EventLifecycleStatus = 'Upcoming' | 'Completed'

export function getEventLifecycleStatus(event: Pick<Event, 'endDateTime'>): EventLifecycleStatus {
  return new Date(event.endDateTime).getTime() <= Date.now() ? 'Completed' : 'Upcoming'
}

export function formatEventEndTime(endDateTime: string): string {
  return new Date(endDateTime).toLocaleString()
}