import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

import EventEmptyState from '../../shared/components/events/EventEmptyState'
import EventErrorState from '../../shared/components/events/EventErrorState'
import EventLoadingState from '../../shared/components/events/EventLoadingState'
import EventStatusBadge from '../../shared/components/events/EventStatusBadge'

import { fetchEvents, fetchRegistrationStatus, registerForEvent, unregisterFromEvent, joinWaitlist, leaveWaitlist } from './eventApi'
import { formatEventEndTime, getEventLifecycleStatus } from './eventTime'

function EventDetailsPage() {
  const auth = useAuth()
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

  const { mutateAsync: joinWaitlistAsync, isPending: isJoiningWaitlist } = useMutation({
    mutationFn: () => joinWaitlist(numericEventId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
      await queryClient.invalidateQueries({ queryKey: ['registration-status', numericEventId] })
      if (event) {
        addToast(`You joined the waitlist for "${event.title}"`, 'success')
      }
    },
  })

  const { mutateAsync: leaveWaitlistAsync, isPending: isLeavingWaitlist } = useMutation({
    mutationFn: () => leaveWaitlist(numericEventId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
      await queryClient.invalidateQueries({ queryKey: ['registration-status', numericEventId] })
      if (event) {
        addToast(`You left the waitlist for "${event.title}"`, 'success')
      }
    },
  })

  if (!Number.isInteger(numericEventId)) {
    return (
      <div className="min-h-[calc(100vh-4rem)] px-4 py-8 md:px-8">
        <div className="mx-auto w-full max-w-[900px] rounded-xl border border-[#4f4633] bg-[#131b2e] p-8 text-center md:p-14">
          <p className="text-[#d3c5ac]">Invalid event id.</p>
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="mt-4 rounded-lg border border-[#4f4633] px-4 py-2 text-sm text-[#dae2fd] transition hover:bg-[#222a3d]"
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

    const confirmed = window.confirm(`Are you sure you want to unregister from ${event.title}?`)
    if (!confirmed) {
      return
    }

    await unregisterAsync()
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="mb-6">
          <Link to="/events" className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-[#ffe1a7] transition hover:text-[#f9bd22]">
            <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_back</span>
            Back to events
          </Link>
        </div>

        {eventsError ? (
          <EventErrorState>
            <p>{eventsError instanceof Error ? eventsError.message : 'An error occurred while loading event details.'}</p>
          </EventErrorState>
        ) : null}

        {isEventsLoading ? (
          <EventLoadingState className="h-[240px]" message="Loading event details..." />
        ) : !event ? (
          <EventEmptyState className="py-16" title="Event not found" description="This event may have been removed." />
        ) : (
          <section className="overflow-hidden rounded-xl border border-[#4f4633] bg-[#131b2e] shadow-sm">
            {event.imageUrl ? (
              <div className="relative h-[320px] overflow-hidden border-b border-[#4f4633] bg-[#060e20]">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="h-full w-full object-cover brightness-[0.68] grayscale-[10%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060e20] to-transparent" />
              </div>
            ) : null}

            <div className="p-6 md:p-8">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-[#ffe1a7]">{event.category}</p>
              <h1 className="mb-4 font-['Hanken_Grotesk'] text-4xl font-semibold tracking-tight text-[#dae2fd]">
                {event.title}
              </h1>
              <p className="mb-8 max-w-3xl text-lg leading-8 text-[#d3c5ac]">{event.description || 'No description provided.'}</p>

              <div className="mb-6 flex flex-wrap gap-2">
                <EventStatusBadge
                  tone={event.status === 'Available' ? 'available' : event.status === 'Full' ? 'full' : 'neutral'}
                >
                  {event.status}
                </EventStatusBadge>
                <EventStatusBadge tone={getEventLifecycleStatus(event) === 'Completed' ? 'completed' : 'active'}>
                  {getEventLifecycleStatus(event)}
                </EventStatusBadge>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm text-[#dae2fd] md:grid-cols-2">
                <p><span className="font-mono text-xs uppercase tracking-wider text-[#d3c5ac]">Starts:</span> {new Date(event.startDateTime).toLocaleString()}</p>
                <p><span className="font-mono text-xs uppercase tracking-wider text-[#d3c5ac]">Ends:</span> {formatEventEndTime(event.endDateTime)}</p>
                <p><span className="font-mono text-xs uppercase tracking-wider text-[#d3c5ac]">Location:</span> {event.location}</p>
                <p><span className="font-mono text-xs uppercase tracking-wider text-[#d3c5ac]">Category:</span> {event.category}</p>
                <p><span className="font-mono text-xs uppercase tracking-wider text-[#d3c5ac]">Capacity:</span> {event.capacity}</p>
              </div>

              {event.eventLink ? (
                <div className="mt-6">
                  <a
                    href={event.eventLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-lg border border-[#34daff]/40 bg-[#00a6e0]/20 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#b6edff] transition hover:bg-[#00a6e0]/30"
                  >
                    Open event link
                  </a>
                </div>
              ) : null}

              {registrationError ? (
                <div className="mt-6 rounded-xl border border-[#ffb4ab]/40 bg-[#93000a]/30 p-4 text-[#ffdad6]">
                  {registrationError instanceof Error ? registrationError.message : 'Failed to load registration state.'}
                </div>
              ) : null}

              <div className="mt-8 border-t border-[#4f4633] pt-6">
                <div className="flex items-center justify-between">
                  <p className="mb-4 text-sm text-[#d3c5ac]">
                    Registered: {registrationStatus?.registered_count ?? 0} / {registrationStatus?.capacity ?? event.capacity}
                  </p>

                  {(auth.canAccess && (auth.canAccess(['organizer', 'admin']) || Number(auth.userId) === event.organizerId)) && (
                    <p className="mb-4 flex items-center gap-2 text-sm text-[#d3c5ac]">
                      <span className="material-symbols-outlined text-base" aria-hidden="true">group_add</span>
                      {registrationStatus?.waitlist_count ?? 0}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {event.status === 'Full' && !registrationStatus?.is_registered ? null : (
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
                      className="rounded-lg bg-[#fbbf24] px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#402d00] transition hover:bg-[#f9bd22] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {registrationStatus?.is_registered ? 'Registered' : 'Register'}
                    </button>
                  )}

                  {registrationStatus?.is_registered ? (
                    <button
                      type="button"
                      onClick={handleUnregister}
                      disabled={isUnregistering || isRegistering}
                      className="rounded-lg border border-[#ffb4ab]/40 bg-[#93000a]/50 px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#ffdad6] transition hover:bg-[#93000a] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Unregister
                    </button>
                  ) : null}

                  {event.status === 'Full' && !registrationStatus?.is_registered ? (
                    registrationStatus?.is_in_waitlist ? (
                      <button
                        type="button"
                        onClick={() => leaveWaitlistAsync()}
                        disabled={isLeavingWaitlist || isJoiningWaitlist}
                        className="rounded-lg border border-[#4f4633] bg-[#222a3d] px-4 py-2 text-sm font-medium text-[#dae2fd] transition hover:bg-[#2d3449] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Leave waitlist
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => joinWaitlistAsync()}
                        disabled={isJoiningWaitlist || isRegistering || isUnregistering || isStatusLoading || getEventLifecycleStatus(event) === 'Completed'}
                        className="rounded-lg bg-[#fbbf24] px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#402d00] transition hover:bg-[#f9bd22] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Join waitlist
                      </button>
                    )
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default EventDetailsPage
