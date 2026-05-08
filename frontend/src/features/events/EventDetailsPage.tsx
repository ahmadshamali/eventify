import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

import { fetchEvents, fetchRegistrationStatus, registerForEvent, unregisterFromEvent } from './eventApi'
import { formatEventEndTime, getEventLifecycleStatus } from './eventTime'

function EventDetailsPage() {
  useAuth()
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { addToast } = useToast()

  const numericEventId = Number(eventId)

  const { data: events = [], isLoading: isEventsLoading, error: eventsError } = useQuery({
    queryKey: ['events'],
    queryFn: () => fetchEvents(),
  })

  const event = events.find((item) => item.id === numericEventId)

  const {
    data: registrationStatus,
    isLoading: isStatusLoading,
    error: registrationError,
  } = useQuery({
    queryKey: ['registration-status', numericEventId],
    queryFn: () => fetchRegistrationStatus(numericEventId),
    enabled: Number.isInteger(numericEventId),
  })

  const { mutateAsync: registerAsync, isPending: isRegistering } = useMutation({
    mutationFn: () => registerForEvent(numericEventId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
      await queryClient.invalidateQueries({ queryKey: ['registration-status', numericEventId] })
      await queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
      if (event) {
        addToast(`You registered for "${event.title}"`, 'success')
      }
    },
  })

  const { mutateAsync: unregisterAsync, isPending: isUnregistering } = useMutation({
    mutationFn: () => unregisterFromEvent(numericEventId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
      await queryClient.invalidateQueries({ queryKey: ['registration-status', numericEventId] })
      await queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
      if (event) {
        addToast(`You unregistered from "${event.title}"`, 'success')
      }
    },
  })

  if (!Number.isInteger(numericEventId)) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-900 px-4 py-10 text-slate-50">
        <div className="relative mx-auto w-full max-w-[900px] rounded-3xl border border-white/10 bg-slate-800/60 p-8 text-center backdrop-blur-md md:p-14">
          <p className="text-slate-300">Invalid event id.</p>
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="mt-4 rounded-lg border border-white/20 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
          >
            Back to Events
          </button>
        </div>
      </div>
    )
  }

  const handleUnregister = async () => {
    if (!event) {
      return
    }

    const confirmed = window.confirm(`Are sure you want to Unregister ${event.title} Event`)
    if (!confirmed) {
      return
    }

    await unregisterAsync()
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 px-5 py-10 text-slate-50">
      <div className="pointer-events-none fixed -left-52 -top-52 h-[600px] w-[600px] rounded-full bg-blue-500/35 blur-[100px]" />
      <div className="pointer-events-none fixed -bottom-52 -right-52 h-[600px] w-[600px] rounded-full bg-cyan-500/25 blur-[100px]" />

      <div className="relative mx-auto w-full max-w-[900px]">
        <div className="mb-6">
          <Link to="/events" className="text-sm text-blue-300 transition hover:text-blue-200">
            Back to events
          </Link>
        </div>

        {eventsError ? (
          <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300">
            <p>{eventsError instanceof Error ? eventsError.message : 'An error occurred while loading event details.'}</p>
          </div>
        ) : null}

        {isEventsLoading ? (
          <div className="flex h-[240px] items-center justify-center text-2xl text-slate-400">
            <div className="mr-4 h-10 w-10 animate-spin rounded-full border-3 border-white/10 border-t-blue-500" />
            <span>Loading event details...</span>
          </div>
        ) : !event ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-800/60 px-8 py-16 text-center backdrop-blur-sm">
            <h3 className="mb-4 text-2xl font-semibold text-white">Event not found</h3>
            <p className="text-slate-300">This event may have been removed.</p>
          </div>
        ) : (
          <section className="rounded-2xl border border-white/10 bg-slate-800/70 p-8 backdrop-blur-md">
            {event.imageUrl ? (
              <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="h-72 w-full object-cover"
                />
              </div>
            ) : null}

            <h1 className="mb-4 bg-gradient-to-br from-white to-slate-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              {event.title}
            </h1>
            <p className="mb-8 text-lg text-slate-300">{event.description || 'No description provided.'}</p>

            <div className="mb-6 flex flex-wrap gap-2">
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

            <div className="grid grid-cols-1 gap-3 text-sm text-slate-300 md:grid-cols-2">
              <p><span className="text-slate-400">Starts:</span> {new Date(event.startDateTime).toLocaleString()}</p>
              <p><span className="text-slate-400">Ends:</span> {formatEventEndTime(event.endDateTime)}</p>
              <p><span className="text-slate-400">Location:</span> {event.location}</p>
              <p><span className="text-slate-400">Category:</span> {event.category}</p>
              <p><span className="text-slate-400">Capacity:</span> {event.capacity}</p>
            </div>

            {event.eventLink ? (
              <div className="mt-6">
                <a
                  href={event.eventLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-lg border border-cyan-400/40 bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/30"
                >
                  Open event link
                </a>
              </div>
            ) : null}

            {registrationError ? (
              <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
                {registrationError instanceof Error ? registrationError.message : 'Failed to load registration state.'}
              </div>
            ) : null}

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="mb-4 text-sm text-slate-300">
                Registered: {registrationStatus?.registered_count ?? 0} / {registrationStatus?.capacity ?? event.capacity}
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => registerAsync()}
                  disabled={
                    isStatusLoading ||
                    isRegistering ||
                    isUnregistering ||
                    Boolean(registrationStatus?.is_registered) ||
                    event.status !== 'Available' ||
                    getEventLifecycleStatus(event) === 'Completed'
                  }
                  className="rounded-lg bg-blue-500 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {registrationStatus?.is_registered ? 'Registered' : 'Register'}
                </button>

                {registrationStatus?.is_registered ? (
                  <button
                    type="button"
                    onClick={handleUnregister}
                    disabled={isUnregistering || isRegistering}
                    className="rounded-lg border border-red-500/60 bg-red-600/90 px-5 py-2.5 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Unregister
                  </button>
                ) : null}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default EventDetailsPage