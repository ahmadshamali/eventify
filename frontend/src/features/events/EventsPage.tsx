import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

import { cancelEvent, fetchEvents, registerForEvent } from './eventApi'

function EventsPage() {
  const queryClient = useQueryClient()
  const { role } = useAuth()
  const canCreateEvent = role === 'organizer' || role === 'admin'

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

  const { mutateAsync: registerAsync, isPending: isRegistering } = useMutation({
    mutationFn: (eventId: number) => registerForEvent(eventId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  const handleCancel = async (eventId: number) => {
    const confirmed = window.confirm('Are you sure you want to cancel this event?')
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
            Eventify
          </h1>
          <p className="text-xl font-light text-slate-400">Discover the most anticipated upcoming events</p>
          {canCreateEvent ? (
            <div className="mt-5">
              <Link className="text-sm text-blue-300 transition hover:text-blue-200" to="/events/create">
                Create a new event
              </Link>
            </div>
          ) : null}
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
                  <h3 className="mb-4 text-2xl font-semibold text-white">
                    {event.title}
                  </h3>
                  <p className="grow text-base leading-7 text-slate-400">
                    {event.description || 'No description provided.'}
                  </p>
                  <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                    <div className="flex flex-col gap-1 text-xs text-slate-500">
                      <span className="text-sm text-slate-400">Event ID: #{event.id}</span>
                      <span>Created: {new Date(event.created_at).toLocaleDateString()}</span>
                      <span>Starts: {new Date(event.startDateTime).toLocaleString()}</span>
                      <span>Location: {event.location}</span>
                      <span>Category: {event.category}</span>
                      <span>Capacity: {event.capacity}</span>
                      <span>Status: {event.status}</span>
                    </div>
                    <div className="flex gap-3">
                      {role === 'organizer' ? (
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
                            onClick={() => handleCancel(event.id)}
                            disabled={isCanceling || event.status === 'Canceled'}
                            aria-label={event.status === 'Canceled' ? `Canceled ${event.title}` : `Delete ${event.title}`}
                            title={event.status === 'Canceled' ? 'Already canceled' : 'Delete event'}
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

                      {role === 'student' ? (
                        <button
                          className="rounded-lg bg-blue-500 px-4 py-3 font-semibold text-white transition hover:bg-blue-600 disabled:opacity-70"
                          onClick={() => registerAsync(event.id)}
                          disabled={isRegistering || event.status !== 'Available'}
                        >
                          {event.status === 'Available' ? 'Register' : event.status}
                        </button>
                      ) : null}
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