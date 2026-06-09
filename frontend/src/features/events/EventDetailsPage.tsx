import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useToast } from '../../context/ToastContext'

import EventEmptyState from '../../shared/components/events/EventEmptyState'
import EventErrorState from '../../shared/components/events/EventErrorState'
import EventLoadingState from '../../shared/components/events/EventLoadingState'
import EventStatusBadge from '../../shared/components/events/EventStatusBadge'

import { fetchEvents, fetchRegistrationStatus, registerForEvent, unregisterFromEvent, joinWaitlist, leaveWaitlist } from './eventApi'
import { formatEventEndTime, getEventLifecycleStatus } from './eventTime'

function EventDetailsPage() {
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
        <div className="mx-auto w-full max-w-[900px] rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-8 text-center md:p-14">
          <p className="text-[var(--on-surface-variant)]">Invalid event id.</p>
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="mt-4 rounded-lg border border-[var(--outline-variant)] px-4 py-2 text-sm text-[var(--on-surface)] transition hover:bg-[var(--surface-container-high)]"
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
          <Link to="/events" className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-[var(--primary)] transition hover:text-[var(--primary-fixed-dim)]">
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
          <section className="overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] shadow-sm">
            {event.imageUrl ? (
              <div className="relative h-[320px] overflow-hidden border-b border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="h-full w-full object-cover brightness-[0.68] grayscale-[10%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-container-lowest)] to-transparent" />
              </div>
            ) : null}

            <div className="p-6 md:p-8">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-[var(--primary)]">{event.category}</p>
              <h1 className="mb-4 font-['Hanken_Grotesk'] text-4xl font-semibold tracking-tight text-[var(--on-surface)]">
                {event.title}
              </h1>
              <p className="mb-8 max-w-3xl text-lg leading-8 text-[var(--on-surface-variant)]">{event.description || 'No description provided.'}</p>

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

              <div className="grid grid-cols-1 gap-3 text-sm text-[var(--on-surface)] md:grid-cols-2">
                <p><span className="font-mono text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">Starts:</span> {new Date(event.startDateTime).toLocaleString()}</p>
                <p><span className="font-mono text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">Ends:</span> {formatEventEndTime(event.endDateTime)}</p>
                <p><span className="font-mono text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">Location:</span> {event.location}</p>
                <p><span className="font-mono text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">Category:</span> {event.category}</p>
                <p><span className="font-mono text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">Capacity:</span> {event.capacity}</p>
                <p className="md:col-span-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">Waitlist:</span>
                  {' '}{registrationStatus?.waitlist_count ?? 0}
                </p>
              </div>

              {event.eventLink ? (
                <div className="mt-6">
                  <a
                    href={event.eventLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-lg border border-[var(--tertiary-container)]/40 bg-[var(--secondary-container)]/20 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--tertiary)] transition hover:bg-[var(--secondary-container)]/30"
                  >
                    Open event link
                  </a>
                </div>
              ) : null}

              {registrationError ? (
                <div className="mt-6 rounded-xl border border-[var(--error)]/40 bg-[var(--error-container)]/30 p-4 text-[var(--on-error-container)]">
                  {registrationError instanceof Error ? registrationError.message : 'Failed to load registration state.'}
                </div>
              ) : null}

              <div className="mt-8 border-t border-[var(--outline-variant)] pt-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-[var(--on-surface-variant)]">
                    Registered: {registrationStatus?.registered_count ?? 0} / {registrationStatus?.capacity ?? event.capacity}
                  </p>

                  {registrationStatus?.is_in_waitlist ? (
                    <p className="text-sm text-[var(--on-surface-variant)]">You are on the waitlist.</p>
                  ) : event.status === 'Full' && !registrationStatus?.is_registered ? (
                    <p className="text-sm text-[var(--on-surface-variant)]">This event is full. Join the waitlist for the next available seat.</p>
                  ) : null}
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
                      className="rounded-lg bg-[var(--primary-container)] px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-primary)] transition hover:bg-[var(--primary-fixed-dim)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {registrationStatus?.is_registered ? 'Registered' : 'Register'}
                    </button>
                  )}

                  {registrationStatus?.is_registered ? (
                    <button
                      type="button"
                      onClick={handleUnregister}
                      disabled={isUnregistering || isRegistering}
                      className="rounded-lg border border-[var(--error)]/40 bg-[var(--error-container)]/50 px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-error-container)] transition hover:bg-[var(--error-container)] disabled:cursor-not-allowed disabled:opacity-60"
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
                        className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-4 py-2 text-sm font-medium text-[var(--on-surface)] transition hover:bg-[var(--surface-container-highest)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Leave waitlist
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => joinWaitlistAsync()}
                        disabled={isJoiningWaitlist || isRegistering || isUnregistering || isStatusLoading || getEventLifecycleStatus(event) === 'Completed'}
                        className="rounded-lg bg-[var(--primary-container)] px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-primary)] transition hover:bg-[var(--primary-fixed-dim)] disabled:cursor-not-allowed disabled:opacity-60"
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
