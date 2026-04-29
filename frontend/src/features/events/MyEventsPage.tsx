import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'

import { cancelEvent, fetchEvents } from './eventApi'
import { formatEventEndTime, getEventLifecycleStatus } from './eventTime'

function MyEventsPage() {
  const { userId } = useAuth()
  const queryClient = useQueryClient()

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events', { includeCompleted: true }],
    queryFn: () => fetchEvents({ includeCompleted: true }),
  })

  const { mutateAsync: cancelEventAsync, isPending: isCanceling } = useMutation({
    mutationFn: (eventId: number) => cancelEvent(eventId, { confirm: true }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  const myEvents = events.filter((event) => String(event.organizerId) === userId)
  const upcomingEvents = myEvents.filter((event) => getEventLifecycleStatus(event) === 'Upcoming')
  const completedEvents = myEvents.filter((event) => getEventLifecycleStatus(event) === 'Completed')

  const handleCancel = async (eventId: number, eventTitle: string) => {
    const confirmed = window.confirm(`Are sure you to delete ${eventTitle}`)
    if (!confirmed) {
      return
    }

    await cancelEventAsync(eventId)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 text-slate-50">
      <div className="pointer-events-none fixed -left-52 -top-52 h-[600px] w-[600px] rounded-full bg-blue-500/35 blur-[100px]" />
      <div className="pointer-events-none fixed -bottom-52 -right-52 h-[600px] w-[600px] rounded-full bg-cyan-500/25 blur-[100px]" />

      <div className="relative mx-auto w-full max-w-[1200px] px-8 py-16">
        <header className="mb-16 text-center">
          <h1 className="mb-4 bg-gradient-to-br from-white to-slate-300 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
            My Events
          </h1>
          <p className="text-xl font-light text-slate-400">Manage the events you created as an organizer</p>
          <div className="mt-5">
            <Link className="text-sm text-blue-300 transition hover:text-blue-200" to="/events/create">
              Create a new event
            </Link>
          </div>
        </header>

        {error && (
          <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">
            <p>{error instanceof Error ? error.message : 'An error occurred'}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center text-2xl text-slate-400">
            <div className="mr-4 h-10 w-10 animate-spin rounded-full border-3 border-white/10 border-t-blue-500" />
            <span>Loading your events...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            <section>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-semibold text-white">Upcoming</h2>
                  <p className="mt-1 text-sm text-slate-400">Events that are still active</p>
                </div>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-100">
                  {upcomingEvents.length}
                </span>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-800/60 px-8 py-16 text-center backdrop-blur-sm">
                  <h3 className="mb-3 text-2xl font-semibold text-white">No upcoming events</h3>
                  <p className="text-slate-300">Create a new event or wait for a completed one to move here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-800/70 p-8 backdrop-blur-md transition duration-300 hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5),0_0_20px_rgba(59,130,246,0.4)]"
                    >
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <h3 className="text-2xl font-semibold text-white">{event.title}</h3>
                        <span className="rounded-full border border-cyan-400/40 bg-cyan-500/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-100">
                          Upcoming
                        </span>
                      </div>
                      <p className="grow text-base leading-7 text-slate-400">{event.description || 'No description provided.'}</p>
                      <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                        <div className="flex flex-col gap-1 text-xs text-slate-500">
                          <span className="text-sm text-slate-400">Event ID: #{event.id}</span>
                          <span>Starts: {new Date(event.startDateTime).toLocaleString()}</span>
                          <span>Ends: {formatEventEndTime(event.endDateTime)}</span>
                          <span>Location: {event.location}</span>
                          <span>Category: {event.category}</span>
                          <span>Capacity: {event.capacity}</span>
                          <span>Status: {event.status}</span>
                        </div>
                        <div className="flex gap-3">
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
                            aria-label={`Cancel ${event.title}`}
                            title="Cancel event"
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-semibold text-white">Completed</h2>
                  <p className="mt-1 text-sm text-slate-400">Events that have already finished</p>
                </div>
                <span className="rounded-full border border-slate-400/30 bg-slate-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
                  {completedEvents.length}
                </span>
              </div>

              {completedEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-800/60 px-8 py-16 text-center backdrop-blur-sm">
                  <h3 className="mb-3 text-2xl font-semibold text-white">No completed events yet</h3>
                  <p className="text-slate-300">Finished events will appear here automatically.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {completedEvents.map((event) => (
                <div
                  key={event.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-800/70 p-8 backdrop-blur-md transition duration-300 hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5),0_0_20px_rgba(59,130,246,0.4)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <h3 className="text-2xl font-semibold text-white">{event.title}</h3>
                    <span className="rounded-full border border-slate-400/40 bg-slate-500/20 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-100">
                      Completed
                    </span>
                  </div>
                  <p className="grow text-base leading-7 text-slate-400">{event.description || 'No description provided.'}</p>
                  <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                    <div className="flex flex-col gap-1 text-xs text-slate-500">
                      <span className="text-sm text-slate-400">Event ID: #{event.id}</span>
                      <span>Starts: {new Date(event.startDateTime).toLocaleString()}</span>
                      <span>Ends: {formatEventEndTime(event.endDateTime)}</span>
                      <span>Location: {event.location}</span>
                      <span>Category: {event.category}</span>
                      <span>Capacity: {event.capacity}</span>
                      <span>Status: {event.status}</span>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        to={`/events/${event.id}/feedbacks`}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-slate-700/70 px-4 py-2 text-sm text-white transition hover:border-white/40 hover:bg-white/5"
                      >
                        Feedbacks
                      </Link>
                      <button
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-red-500/60 bg-red-600/90 text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => handleCancel(event.id, event.title)}
                        disabled={isCanceling}
                        aria-label={`Cancel ${event.title}`}
                        title="Cancel event"
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
                    </div>
                  </div>
                </div>
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

export default MyEventsPage