import type { Event } from '../events/event.types'
import { getEventLifecycleStatus } from '../events/eventTime'

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}

export function getFillRate(event: Event): number {
  if (event.capacity <= 0) {
    return 0
  }

  return Math.min((event.registered_count / event.capacity) * 100, 100)
}

export function getOrganizerEvents(events: Event[], userId: string | null): Event[] {
  return events.filter((event) => String(event.organizerId) === userId)
}

export function getUpcomingOrganizerEvents(events: Event[]): Event[] {
  return events
    .filter((event) => event.status !== 'Canceled' && getEventLifecycleStatus(event) === 'Upcoming')
    .sort((left, right) => new Date(left.startDateTime).getTime() - new Date(right.startDateTime).getTime())
}

export function getCompletedOrganizerEvents(events: Event[]): Event[] {
  return events
    .filter((event) => event.status !== 'Canceled' && getEventLifecycleStatus(event) === 'Completed')
    .sort((left, right) => new Date(right.startDateTime).getTime() - new Date(left.startDateTime).getTime())
}

export function getCanceledOrganizerEvents(events: Event[]): Event[] {
  return events.filter((event) => event.status === 'Canceled')
}

export function getTotalRegistrations(events: Event[]): number {
  return events.reduce((sum, event) => sum + event.registered_count, 0)
}

export function getTotalCapacity(events: Event[]): number {
  return events.reduce((sum, event) => sum + event.capacity, 0)
}