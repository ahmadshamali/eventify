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
    <div className="rounded-xl border border-[#4f4633] bg-[#131b2e] p-5 shadow-sm">
      <p className="font-mono text-xs uppercase tracking-wider text-[#d3c5ac]">{label}</p>
      <p className="mt-3 font-['Hanken_Grotesk'] text-4xl font-semibold text-[#dae2fd]">{value}</p>
      {helper ? <p className="mt-2 text-xs text-[#d3c5ac]">{helper}</p> : null}
    </div>
  )
}

function ActionCard({ to, title, description, tone }: { to: string; title: string; description: string; tone: 'cyan' | 'slate' | 'emerald' }) {
  const toneClasses = {
    cyan: 'border-[#34daff]/40 bg-[#00a6e0]/20 text-[#b6edff] hover:bg-[#00a6e0]/30',
    slate: 'border-[#4f4633] bg-[#131b2e] text-[#dae2fd] hover:bg-[#171f33]',
    emerald: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20',
  }

  return (
    <Link
      to={to}
      className={`rounded-xl border p-5 transition duration-200 ${toneClasses[tone]}`}
    >
      <h3 className="font-['Hanken_Grotesk'] text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[#d3c5ac]">{description}</p>
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
    <div className="overflow-hidden rounded-xl border border-[#4f4633] bg-[#131b2e] p-6 shadow-sm transition duration-200 hover:border-[#f9bd22]/60 hover:bg-[#171f33]">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate font-['Hanken_Grotesk'] text-xl font-semibold text-[#dae2fd]">{event.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-[#d3c5ac]">{event.description || 'No description provided.'}</p>
          </div>
          <span className="shrink-0 rounded border border-[#4f4633] bg-[#222a3d] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#d3c5ac]">
            {statusLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm text-[#dae2fd] sm:grid-cols-2">
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-[#d3c5ac]">Starts</span>
            <span>{formatEventStartTime(event.startDateTime)}</span>
          </div>
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-[#d3c5ac]">Ends</span>
            <span>{formatEventEndTime(event.endDateTime)}</span>
          </div>
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-[#d3c5ac]">Location</span>
            <span>{event.location}</span>
          </div>
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-[#d3c5ac]">Category</span>
            <span>{event.category}</span>
          </div>
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-[#d3c5ac]">Capacity</span>
            <span>{event.capacity}</span>
          </div>
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-[#d3c5ac]">Registrations</span>
            <span>{event.registered_count} / {event.capacity}</span>
          </div>
        </div>

        <div className="pt-1">
          <div className="mb-2 flex items-center justify-between text-xs text-[#d3c5ac]">
            <span>Capacity filled</span>
            <span>{formatPercentage(fillRate)}</span>
          </div>
          <div className="h-2 rounded-full bg-[#222a3d]">
            <div className="h-2 rounded-full bg-[#f9bd22] transition-all" style={{ width: `${fillRate}%` }} />
          </div>
        </div>

        {showActions ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {isCompleted ? (
              <Link
                to={`/events/${event.id}/feedbacks`}
                className="rounded-lg border border-[#34daff]/40 bg-[#00a6e0]/20 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#b6edff] transition hover:bg-[#00a6e0]/30"
              >
                Feedbacks
              </Link>
            ) : (
              <Link
                to={`/events/${event.id}/edit`}
                className="rounded-lg border border-[#4f4633] bg-[#222a3d] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#dae2fd] transition hover:bg-[#2d3449] hover:text-[#ffe1a7]"
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
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 md:px-8">
      <EventPageBackdrop />

      <div className="mx-auto w-full max-w-[1280px]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.85fr)]">
          <header className="rounded-xl border border-[#4f4633] bg-[#131b2e] p-6 shadow-sm md:p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-[#ffe1a7]">Organizer Dashboard</p>
            <h1 className="mt-3 font-['Hanken_Grotesk'] text-4xl font-semibold tracking-tight text-[#dae2fd] md:text-5xl">
              Manage your events from one place
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#d3c5ac] md:text-lg">
              Track upcoming events, review completed ones, cancel outdated listings, and jump into create or feedback actions without leaving the dashboard.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/events"
                className="rounded-lg border border-[#4f4633] bg-[#222a3d] px-5 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#dae2fd] transition hover:bg-[#2d3449] hover:text-[#ffe1a7]"
              >
                View All Events
              </Link>
            </div>
          </header>

          <aside className="rounded-xl border border-[#4f4633] bg-[#131b2e] p-6 shadow-sm md:p-8">
            <p className="font-mono text-xs uppercase tracking-widest text-[#d3c5ac]">At a Glance</p>
            {nextEvent ? (
              <div className="mt-4 space-y-4">
                <div>
                  <h2 className="font-['Hanken_Grotesk'] text-2xl font-semibold text-[#dae2fd]">Next Event</h2>
                  <p className="mt-2 text-[#d3c5ac]">{nextEvent.title}</p>
                </div>
                <div className="space-y-2 text-sm text-[#d3c5ac]">
                  <p>Starts: {formatEventStartTime(nextEvent.startDateTime)}</p>
                  <p>Ends: {formatEventEndTime(nextEvent.endDateTime)}</p>
                  <p>Location: {nextEvent.location}</p>
                  <p>Status: {nextEvent.status}</p>
                </div>
                <div className="rounded-xl border border-[#4f4633] bg-[#0b1326] p-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-[#d3c5ac]">
                    <span>Fill rate</span>
                    <span>{formatPercentage(getFillRate(nextEvent))}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#222a3d]">
                    <div className="h-2 rounded-full bg-[#f9bd22]" style={{ width: `${getFillRate(nextEvent)}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-[#4f4633] bg-[#0b1326] p-6 text-[#d3c5ac]">
                No upcoming events yet. Create your first event to populate the dashboard.
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-[#4f4633] bg-[#0b1326] p-4">
                <p className="text-[#d3c5ac]">Total</p>
                <p className="mt-1 text-2xl font-semibold text-[#dae2fd]">{myEvents.length}</p>
              </div>
              <div className="rounded-xl border border-[#4f4633] bg-[#0b1326] p-4">
                <p className="text-[#d3c5ac]">Fill Avg</p>
                <p className="mt-1 text-2xl font-semibold text-[#dae2fd]">{formatPercentage(averageFillRate)}</p>
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
          <div className="mt-6 rounded-xl border border-[#ffb4ab]/40 bg-[#93000a]/30 p-4 text-[#ffdad6]">
            <p>{error instanceof Error ? error.message : 'An error occurred while loading your events.'}</p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-6 rounded-xl border border-[#4f4633] bg-[#131b2e] p-8 text-[#d3c5ac]">
            Loading organizer dashboard...
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            <section>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-['Hanken_Grotesk'] text-2xl font-semibold text-[#dae2fd]">Upcoming Events</h2>
                  <p className="mt-1 text-sm text-[#d3c5ac]">Events that are still active and ready to manage</p>
                </div>
                <span className="rounded border border-[#34daff]/40 bg-[#00a6e0]/20 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#b6edff]">
                  {upcomingEvents.length}
                </span>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#4f4633] bg-[#131b2e] px-8 py-16 text-center text-[#d3c5ac]">
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
                            className="rounded-lg border border-[#ffb4ab]/40 bg-[#93000a]/30 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#ffdad6] transition hover:bg-[#93000a]/50 disabled:cursor-not-allowed disabled:opacity-60"
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
                  <h2 className="font-['Hanken_Grotesk'] text-2xl font-semibold text-[#dae2fd]">Completed Events</h2>
                  <p className="mt-1 text-sm text-[#d3c5ac]">Finished events with feedback and performance context</p>
                </div>
                <span className="rounded border border-[#4f4633] bg-[#222a3d] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#d3c5ac]">
                  {completedEvents.length}
                </span>
              </div>

              {completedEvents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#4f4633] bg-[#131b2e] px-8 py-16 text-center text-[#d3c5ac]">
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
                  <h2 className="font-['Hanken_Grotesk'] text-2xl font-semibold text-[#dae2fd]">Canceled Events</h2>
                  <p className="mt-1 text-sm text-[#d3c5ac]">Events that were removed from circulation</p>
                </div>
                <span className="rounded border border-[#4f4633] bg-[#222a3d] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#d3c5ac]">
                  {canceledEvents.length}
                </span>
              </div>

              {canceledEvents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#4f4633] bg-[#131b2e] px-8 py-16 text-center text-[#d3c5ac]">
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
