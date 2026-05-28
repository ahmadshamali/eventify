import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

import EventCardShell from '../../shared/components/events/EventCardShell'
import EventEmptyState from '../../shared/components/events/EventEmptyState'
import EventErrorState from '../../shared/components/events/EventErrorState'
import EventLoadingState from '../../shared/components/events/EventLoadingState'
import EventPageBackdrop from '../../shared/components/events/EventPageBackdrop'
import EventPrimaryLinkButton from '../../shared/components/events/EventPrimaryLinkButton'
import EventStatusBadge from '../../shared/components/events/EventStatusBadge'

import { cancelEvent, fetchEvents } from './eventApi'
import type { Event } from './event.types'
import { formatEventStartTime, getEventLifecycleStatus } from './eventTime'

function EventsPage() {
  const queryClient = useQueryClient()
  const { role, userId } = useAuth()

  const { data: events = [], isLoading: loading, error } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: () => fetchEvents(),
  })

  const { mutateAsync: cancelEventAsync, isPending: isCanceling } = useMutation({
    mutationFn: (eventId: number) => cancelEvent(eventId, { confirm: true }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  const handleCancel = async (eventId: number, eventTitle: string) => {
    const confirmed = window.confirm(`Are sure you to delete ${eventTitle}`)
    if (!confirmed) {
      return
    }
    await cancelEventAsync(eventId)
  }

  const canManageEvent = (eventOrganizerId: number | null) => role === 'organizer' && String(eventOrganizerId) === userId

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 text-slate-50">
      <EventPageBackdrop />

      <div className="relative mx-auto w-full max-w-[1200px] px-8 py-16">
        <header className="mb-16 text-center">
          <h1 className="mb-4 bg-gradient-to-br from-white to-slate-300 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
            Eventify
          </h1>
          <p className="text-xl font-light text-slate-400">Discover the most anticipated upcoming events</p>
        </header>

        {error && (
          <EventErrorState>
            <p>{error instanceof Error ? error.message : 'An error occurred'}</p>
          </EventErrorState>
        )}

        {loading ? (
          <EventLoadingState className="h-[200px]" message="Loading events..." />
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {events.filter((event) => getEventLifecycleStatus(event) !== 'Completed').length === 0 && !error ? (
              <EventEmptyState
                className="col-span-full"
                title="No events found"
                description="The backend database is empty or not seeded yet."
              />
            ) : (
              events
                .filter((event) => getEventLifecycleStatus(event) !== 'Completed')
                .map((event) => (
                <EventCardShell key={event.id}>
                  {event.imageUrl ? (
                    <div className="mb-5 overflow-hidden rounded-xl border border-white/10 bg-slate-900/70">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                  ) : null}
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <h3 className="text-2xl font-semibold text-white">{event.title}</h3>
                    <div className="flex flex-col items-end gap-2">
                      <EventStatusBadge tone={event.status === 'Full' ? 'full' : 'available'}>
                        {event.status === 'Full' ? 'Full' : 'Available'}
                      </EventStatusBadge>
                    </div>
                  </div>
                  <p className="grow text-sm leading-6 text-slate-400">
                    {event.description || 'No description provided.'}
                  </p>
                  <div className="mt-8 border-t border-white/5 pt-6">
                    <div className="flex flex-col gap-1 text-sm text-slate-500">
                      <span>Starts: {formatEventStartTime(event.startDateTime)}</span>
                      <span>Location: {event.location}</span>
                      <span>
                        Capacity: {event.registered_count}/{event.capacity}
                      </span>
                    </div>

                    <div className="mt-4 flex items-end justify-end gap-3 pr-1 pb-1">
                      {event.eventLink ? (
                        <a
                          href={event.eventLink}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-white/20 px-4 py-3 font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
                        >
                          Link
                        </a>
                      ) : null}
                      {canManageEvent(event.organizerId) && getEventLifecycleStatus(event) === 'Upcoming' ? (
                        <>
                          <Link
                            to={`/events/${event.id}/edit`}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 text-white transition hover:border-white/40 hover:bg-white/5"
                            aria-label={`Edit ${event.title}`}
                            title="Edit event"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-5 w-5"
                            >
                              <path d="M12 20h9" />
                              <path d="m16.5 3.5 4 4L7 21l-4 1 1-4Z" />
                            </svg>
                          </Link>
                          <button
                            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-red-500/60 bg-red-600/90 text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => handleCancel(event.id, event.title)}
                            disabled={isCanceling}
                            aria-label={`Delete ${event.title}`}
                            title="Delete event"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-5 w-5"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                              <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                          </button>
                        </>
                      ) : null}

                      <EventPrimaryLinkButton to={`/events/${event.id}/details`}>Details</EventPrimaryLinkButton>
                    </div>
                  </div>
                </EventCardShell>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventsPage;