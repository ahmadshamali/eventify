import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import EventPageBackdrop from '../../shared/components/events/EventPageBackdrop'

import { cancelEvent, fetchEvents } from '../events/eventApi'
import type { Event } from '../events/event.types'
import { formatEventEndTime, formatEventStartTime } from '../events/eventTime'
import {
  formatPercentage,
  getCanceledOrganizerEvents,
  getCompletedOrganizerEvents,
  getFillRate,
  getOrganizerEvents,
  getTotalCapacity,
  getTotalRegistrations,
  getUpcomingOrganizerEvents,
} from './organizerDashboard.helpers'

function StatCard({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-5 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.8)] backdrop-blur-md">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      {helper ? <p className="mt-2 text-xs text-slate-400">{helper}</p> : null}
    </div>
  )
}

function ActionCard({ to, title, description, tone }: { to: string; title: string; description: string; tone: 'cyan' | 'slate' | 'emerald' }) {
  const toneClasses = {
    cyan: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/15',
    slate: 'border-white/10 bg-white/5 text-white hover:bg-white/10',
    emerald: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15',
  }

  return (
    <Link
      to={to}
      className={`rounded-2xl border p-5 transition duration-300 hover:-translate-y-0.5 ${toneClasses[tone]}`}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </Link>
  )
}

function EventCard({
  event,
  showActions = true,
  statusLabel,
}: {
  event: Event
  showActions?: boolean
  statusLabel: string
}) {
  const fillRate = getFillRate(event)
  const isCompleted = statusLabel === 'Completed'

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-800/70 p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.9)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-white/20">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

      <div className="relative flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-xl font-semibold text-white">{event.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-400">{event.description || 'No description provided.'}</p>
          </div>
          <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
            {statusLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm text-slate-300 sm:grid-cols-2">
          <div>
            <span className="block text-xs uppercase tracking-wide text-slate-500">Starts</span>
            <span>{formatEventStartTime(event.startDateTime)}</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wide text-slate-500">Ends</span>
            <span>{formatEventEndTime(event.endDateTime)}</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wide text-slate-500">Location</span>
            <span>{event.location}</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wide text-slate-500">Category</span>
            <span>{event.category}</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wide text-slate-500">Capacity</span>
            <span>{event.capacity}</span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wide text-slate-500">Registrations</span>
            <span>{event.registered_count} / {event.capacity}</span>
          </div>
        </div>

        <div className="pt-1">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
            <span>Capacity filled</span>
            <span>{formatPercentage(fillRate)}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10">
            <div className="h-2 rounded-full bg-cyan-400 transition-all" style={{ width: `${fillRate}%` }} />
          </div>
        </div>

        {showActions ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {isCompleted ? (
              <Link
                to={`/events/${event.id}/feedbacks`}
                className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/15"
              >
                Feedbacks
              </Link>
            ) : (
              <Link
                to={`/events/${event.id}/edit`}
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Edit
              </Link>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function OrganizerDashboardPage() {
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

  const myEvents = useMemo(
    () => getOrganizerEvents(events, userId),
    [events, userId],
  )

  const upcomingEvents = useMemo(
    () => getUpcomingOrganizerEvents(myEvents),
    [myEvents],
  )

  const completedEvents = useMemo(
    () => getCompletedOrganizerEvents(myEvents),
    [myEvents],
  )

  const canceledEvents = useMemo(
    () => getCanceledOrganizerEvents(myEvents),
    [myEvents],
  )

  const totalRegistrations = useMemo(
    () => getTotalRegistrations(myEvents),
    [myEvents],
  )

  const totalCapacity = useMemo(
    () => getTotalCapacity(myEvents),
    [myEvents],
  )

  const averageFillRate = totalCapacity > 0 ? (totalRegistrations / totalCapacity) * 100 : 0
  const nextEvent = upcomingEvents[0] ?? null

  const handleCancel = async (eventId: number, eventTitle: string) => {
    const confirmed = window.confirm(`Are you sure you want to cancel ${eventTitle}?`)
    if (!confirmed) {
      return
    }

    await cancelEventAsync(eventId)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <EventPageBackdrop />

      <div className="relative mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.85fr)]">
          <header className="rounded-3xl border border-white/10 bg-slate-800/60 p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.9)] backdrop-blur-md md:p-8">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/80">Organizer Dashboard</p>
            <h1 className="mt-3 bg-gradient-to-br from-white to-slate-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
              Manage your events from one place
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Track upcoming events, review completed ones, cancel outdated listings, and jump into create or feedback actions without leaving the dashboard.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/events"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View All Events
              </Link>
            </div>
          </header>

          <aside className="rounded-3xl border border-white/10 bg-slate-800/60 p-6 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.9)] backdrop-blur-md md:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">At a Glance</p>
            {nextEvent ? (
              <div className="mt-4 space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Next Event</h2>
                  <p className="mt-2 text-slate-300">{nextEvent.title}</p>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>Starts: {formatEventStartTime(nextEvent.startDateTime)}</p>
                  <p>Ends: {formatEventEndTime(nextEvent.endDateTime)}</p>
                  <p>Location: {nextEvent.location}</p>
                  <p>Status: {nextEvent.status}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                    <span>Fill rate</span>
                    <span>{formatPercentage(getFillRate(nextEvent))}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${getFillRate(nextEvent)}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-slate-300">
                No upcoming events yet. Create your first event to populate the dashboard.
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-400">Total</p>
                <p className="mt-1 text-2xl font-semibold text-white">{myEvents.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-400">Fill Avg</p>
                <p className="mt-1 text-2xl font-semibold text-white">{formatPercentage(averageFillRate)}</p>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Events" value={myEvents.length} helper="All events created by you" />
          <StatCard label="Upcoming" value={upcomingEvents.length} helper="Active and not yet finished" />
          <StatCard label="Completed" value={completedEvents.length} helper="Finished but not canceled" />
          <StatCard label="Registrations" value={totalRegistrations} helper={`${formatPercentage(averageFillRate)} average fill rate`} />
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <ActionCard
            to="/events/create"
            title="Create a new event"
            description="Open the event form and publish something new from the dashboard."
            tone="cyan"
          />
          <ActionCard
            to="/events"
            title="Review the event catalog"
            description="Check how your events sit alongside the rest of the platform."
            tone="slate"
          />
          <ActionCard
            to={completedEvents[0] ? `/events/${completedEvents[0].id}/feedbacks` : '/events'}
            title="Inspect feedback"
            description={completedEvents[0] ? 'Jump into the latest completed event feedback.' : 'Feedback links become available after events are completed.'}
            tone="emerald"
          />
        </section>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">
            <p>{error instanceof Error ? error.message : 'An error occurred while loading your events.'}</p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-800/60 p-8 text-slate-300">
            Loading organizer dashboard...
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            <section>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Upcoming Events</h2>
                  <p className="mt-1 text-sm text-slate-400">Events that are still active and ready to manage</p>
                </div>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-100">
                  {upcomingEvents.length}
                </span>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-800/60 px-8 py-16 text-center text-slate-300">
                  No upcoming events yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="space-y-3">
                      <EventCard event={event} statusLabel={event.status} showActions />
                      {event.status !== 'Canceled' ? (
                        <div className="flex flex-wrap gap-2 px-1">
                          <button
                            type="button"
                            onClick={() => handleCancel(event.id, event.title)}
                            disabled={isCanceling}
                            className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Cancel Event
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Completed Events</h2>
                  <p className="mt-1 text-sm text-slate-400">Finished events with feedback and performance context</p>
                </div>
                <span className="rounded-full border border-slate-400/30 bg-slate-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
                  {completedEvents.length}
                </span>
              </div>

              {completedEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-800/60 px-8 py-16 text-center text-slate-300">
                  No completed events yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {completedEvents.map((event) => (
                    <EventCard key={event.id} event={event} statusLabel="Completed" showActions />
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Canceled Events</h2>
                  <p className="mt-1 text-sm text-slate-400">Events that were removed from circulation</p>
                </div>
                <span className="rounded-full border border-slate-400/30 bg-slate-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
                  {canceledEvents.length}
                </span>
              </div>

              {canceledEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-800/60 px-8 py-16 text-center text-slate-300">
                  No canceled events.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {canceledEvents.map((event) => (
                    <EventCard key={event.id} event={event} statusLabel="Canceled" showActions={false} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}