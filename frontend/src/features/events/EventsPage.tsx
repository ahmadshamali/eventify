import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from './eventApi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function EventsPage() {
  const { canAccess } = useAuth()
  const canCreateEvent = canAccess(['organizer', 'admin'])

  const { data: events = [], isLoading: loading, error } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  })

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
                    {event.title} ({event.subtitle})
                  </h3>
                  <p className="grow text-base leading-7 text-slate-400">
                    {event.description || 'No description provided.'}
                  </p>
                  <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                    <div className="flex flex-col gap-1 text-xs text-slate-500">
                      <span className="text-sm text-slate-400">Event ID: #{event.id}</span>
                      <span>Created: {new Date(event.created_at).toLocaleDateString()}</span>
                      <span>Capacity: {event.capacity ? event.capacity : 'Unlimited'}</span>
                    </div>
                    <button className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                      Details
                    </button>
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