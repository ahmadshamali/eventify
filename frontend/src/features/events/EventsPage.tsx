import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

import { cancelEvent, fetchEvents } from './eventApi'
import { formatEventEndTime, getEventLifecycleStatus } from './eventTime'

function EventsPage() {
  const queryClient = useQueryClient()
  const { role, userId } = useAuth()

  const { data: events = [], isLoading: loading, error } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
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
      <div className="pointer-events-none fixed -left-52 -top-52 h-[600px] w-[600px] rounded-full bg-blue-500/35 blur-[100px]" />
      <div className="pointer-events-none fixed -bottom-52 -right-52 h-[600px] w-[600px] rounded-full bg-cyan-500/25 blur-[100px]" />

      <div className="relative mx-auto w-full max-w-[1200px] px-8 py-16">
        <header className="mb-16 text-center">
          <h1 className="mb-4 bg-gradient-to-br from-white to-slate-300 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
            Eventify
          </h1>
          <p className="text-xl font-light text-slate-400">Discover the most anticipated upcoming events</p>
        </header>

        {error && (
          <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">
            <p>{error instanceof Error ? error.message : 'An error occurred'}</p>
          </div>
        )}

        {loading ? (
          <div className="flex h-[200px] items-center justify-center text-2xl text-slate-400">
            <div className="mr-4 h-10 w-10 animate-spin rounded-full border-3 border-white/10 border-t-blue-500" />
            <span>Loading events...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {events.length === 0 && !error ? (
              <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-slate-800/60 px-8 py-20 text-center backdrop-blur-sm">
                <h3 className="mb-4 text-2xl font-semibold text-white">No events found</h3>
                <p className="text-slate-300">The backend database is empty or not seeded yet.</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-800/70 p-8 backdrop-blur-md transition duration-300 hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5),0_0_20px_rgba(59,130,246,0.4)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
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
                      <span
                        className={[
                          'rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
                          event.status === 'Available'
                            ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-200'
                            : event.status === 'Full'
                              ? 'border-red-400/40 bg-red-500/20 text-red-200'
                              : 'border-white/20 bg-white/10 text-slate-200',
                        ].join(' ')}
                      >
                        {event.status}
                      </span>
                      <span
                        className={[
                          'rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
                          getEventLifecycleStatus(event) === 'Completed'
                            ? 'border-slate-400/40 bg-slate-500/20 text-slate-100'
                            : 'border-cyan-400/40 bg-cyan-500/20 text-cyan-100',
                        ].join(' ')}
                      >
                        {getEventLifecycleStatus(event)}
                      </span>
                    </div>
                  </div>
                  <p className="grow text-base leading-7 text-slate-400">
                    {event.description || 'No description provided.'}
                  </p>
                  <div className="mt-8 border-t border-white/5 pt-6">
                    <div className="flex flex-col gap-1 text-xs text-slate-500">
                      <span className="text-sm text-slate-400">Event ID: #{event.id}</span>
                      <span>Created: {new Date(event.created_at).toLocaleDateString()}</span>
                      <span>Starts: {new Date(event.startDateTime).toLocaleString()}</span>
                      <span>Ends: {formatEventEndTime(event.endDateTime)}</span>
                      <span>Location: {event.location}</span>
                      <span>Category: {event.category}</span>
                      <span>Capacity: {event.capacity}</span>
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
                      {canManageEvent(event.organizerId) ? (
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

                      <Link
                        className="rounded-lg bg-blue-500 px-4 py-3 font-semibold text-white transition hover:bg-blue-600"
                        to={`/events/${event.id}/details`}
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventsPage;