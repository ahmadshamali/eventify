import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import EventPageBackdrop from '../../shared/components/events/EventPageBackdrop'

import { cancelEvent, fetchEvents } from '../events/eventApi'
import type { Event } from '../events/event.types'
import { formatEventStartTime } from '../events/eventTime'
import {
  formatPercentage,
  getCanceledOrganizerEvents,
  getCompletedOrganizerEvents,
  getFillRate,
  getOrganizerEvents,
  getTotalRegistrations,
  getUpcomingOrganizerEvents,
} from './organizerDashboard.helpers'

type EventTab = 'upcoming' | 'completed' | 'canceled'

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-5 shadow-sm">
      <p className="font-mono text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">{label}</p>
      <p className="mt-2 font-['Hanken_Grotesk'] text-3xl font-semibold text-[var(--on-surface)]">{value}</p>
    </div>
  )
}

function EventCard({
  event,
  tab,
  isCanceling,
  onCancel,
}: {
  event: Event
  tab: EventTab
  isCanceling: boolean
  onCancel: (event: Event) => void
}) {
  const fillRate = getFillRate(event)

  return (
    <article className="rounded-xl border border-[var(--outline-variant)] bg-[var(--background)] p-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="min-w-0">
          <h3 className="truncate font-['Hanken_Grotesk'] text-xl font-semibold text-[var(--on-surface)]">
            {event.title}
          </h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--on-surface-variant)]">
            <span>{formatEventStartTime(event.startDateTime)}</span>
            <span>{event.location}</span>
            <span>{event.category}</span>
          </div>
        </div>

        <span className="w-fit shrink-0 rounded border border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--on-surface-variant)]">
          {tab}
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs text-[var(--on-surface-variant)]">
          <span>{event.registered_count} of {event.capacity} registered</span>
          <span>{formatPercentage(fillRate)}</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--surface-container-high)]">
          <div className="h-2 rounded-full bg-[var(--primary-fixed-dim)]" style={{ width: `${fillRate}%` }} />
        </div>
      </div>

      {tab !== 'canceled' ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {tab === 'completed' ? (
            <Link
              to={`/events/${event.id}/feedbacks`}
              className="rounded-lg border border-[var(--tertiary-container)]/40 bg-[var(--secondary-container)]/20 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--tertiary)] transition hover:bg-[var(--secondary-container)]/30"
            >
              View Feedback
            </Link>
          ) : (
            <>
              <Link
                to={`/events/${event.id}/edit`}
                className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-surface)] transition hover:text-[var(--primary)]"
              >
                Edit
              </Link>
              <Link
                to="/attendance/scan"
                className="rounded-lg border border-[var(--tertiary-container)]/40 bg-[var(--secondary-container)]/20 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--tertiary)] transition hover:bg-[var(--secondary-container)]/30"
              >
                Scan Attendance
              </Link>
              <button
                type="button"
                onClick={() => onCancel(event)}
                disabled={isCanceling}
                className="rounded-lg px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-error-container)] transition hover:bg-[var(--error-container)]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      ) : null}
    </article>
  )
}

export default function OrganizerDashboardPage() {
  const [activeTab, setActiveTab] = useState<EventTab>('upcoming')
  const { userId } = useAuth()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events', { includeCompleted: true }],
    queryFn: () => fetchEvents({ includeCompleted: true }),
  })

  const { mutateAsync: cancelEventAsync, isPending: isCanceling } = useMutation({
    mutationFn: (eventId: number) => cancelEvent(eventId, { confirm: true }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
      addToast(`Event "${data.title}" canceled successfully`, 'success')
    },
    onError: (mutationError: Error) => {
      addToast(mutationError.message || 'Unable to cancel event', 'error')
    },
  })

  const myEvents = useMemo(() => getOrganizerEvents(events, userId), [events, userId])
  const upcomingEvents = useMemo(() => getUpcomingOrganizerEvents(myEvents), [myEvents])
  const completedEvents = useMemo(() => getCompletedOrganizerEvents(myEvents), [myEvents])
  const canceledEvents = useMemo(() => getCanceledOrganizerEvents(myEvents), [myEvents])
  const totalRegistrations = useMemo(() => getTotalRegistrations(myEvents), [myEvents])

  const eventsByTab: Record<EventTab, Event[]> = {
    upcoming: upcomingEvents,
    completed: completedEvents,
    canceled: canceledEvents,
  }

  const handleCancel = async (event: Event) => {
    const confirmed = window.confirm(`Are you sure you want to cancel ${event.title}?`)
    if (confirmed) {
      await cancelEventAsync(event.id)
    }
  }

  const tabs: { id: EventTab; label: string; count: number }[] = [
    { id: 'upcoming', label: 'Upcoming', count: upcomingEvents.length },
    { id: 'completed', label: 'Completed', count: completedEvents.length },
    { id: 'canceled', label: 'Canceled', count: canceledEvents.length },
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 md:px-8">
      <EventPageBackdrop />

      <div className="mx-auto w-full max-w-[1100px]">
        <header className="flex flex-col justify-between gap-5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-6 shadow-sm md:flex-row md:items-end md:p-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--primary)]">Organizer Dashboard</p>
            <h1 className="mt-2 font-['Hanken_Grotesk'] text-4xl font-semibold tracking-tight text-[var(--on-surface)]">
              Your events
            </h1>
            <p className="mt-2 text-[var(--on-surface-variant)]">Create events and manage the ones you already published.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/attendance/scan"
              className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-surface)] transition hover:text-[var(--primary)]"
            >
              Scan Attendance
            </Link>
            <Link
              to="/events/create"
              className="rounded-lg bg-[var(--primary)] px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-primary)] transition hover:opacity-90"
            >
              Create Event
            </Link>
          </div>
        </header>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Upcoming" value={upcomingEvents.length} />
          <StatCard label="Registrations" value={totalRegistrations} />
          <StatCard label="Completed" value={completedEvents.length} />
        </div>

        {error ? (
          <div className="mt-5 rounded-xl border border-[var(--error)]/40 bg-[var(--error-container)]/30 p-4 text-[var(--on-error-container)]">
            {error instanceof Error ? error.message : 'An error occurred while loading your events.'}
          </div>
        ) : null}

        <section className="mt-5 overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] shadow-sm">
          <div className="grid grid-cols-3 border-b border-[var(--outline-variant)]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'px-3 py-4 font-mono text-xs font-semibold uppercase tracking-wider transition sm:px-5',
                  activeTab === tab.id
                    ? 'bg-[var(--surface-container-high)] text-[var(--primary)]'
                    : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)]',
                ].join(' ')}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="p-4 md:p-6">
            {isLoading ? (
              <p className="text-[var(--on-surface-variant)]">Loading your events...</p>
            ) : eventsByTab[activeTab].length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--outline-variant)] bg-[var(--background)] px-6 py-12 text-center text-[var(--on-surface-variant)]">
                No {activeTab} events.
              </div>
            ) : (
              <div className="space-y-4">
                {eventsByTab[activeTab].map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    tab={activeTab}
                    isCanceling={isCanceling}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
