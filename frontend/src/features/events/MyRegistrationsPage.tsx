import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { useToast } from '../../context/ToastContext'
import EventCardShell from '../../shared/components/events/EventCardShell'
import EventEmptyState from '../../shared/components/events/EventEmptyState'
import EventErrorState from '../../shared/components/events/EventErrorState'
import EventLoadingState from '../../shared/components/events/EventLoadingState'
import EventPageBackdrop from '../../shared/components/events/EventPageBackdrop'
import EventPrimaryLinkButton from '../../shared/components/events/EventPrimaryLinkButton'
import EventStatusBadge from '../../shared/components/events/EventStatusBadge'
import { fetchMyRegistrations } from './eventApi'
import type { StudentRegistrationEvent } from './event.types'
import { formatEventEndTime, getEventLifecycleStatus } from './eventTime'
import { getFeedbackForRegistration, submitFeedback } from '../feedback/feedbackApi'
import type { FeedbackRead } from '../feedback/feedbackApi'

function MyRegistrationsPage() {
  const { data: registrations = [], isLoading, error } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: fetchMyRegistrations,
  })

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 md:px-8">
      <EventPageBackdrop />

      <div className="mx-auto w-full max-w-[1280px]">
        <header className="mb-8 rounded-xl border border-[#4f4633] bg-[#131b2e] p-6 shadow-sm md:p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-[#ffe1a7]">Student Activity</p>
          <h1 className="mt-2 font-['Hanken_Grotesk'] text-4xl font-semibold tracking-tight text-[#dae2fd]">
            My Registrations
          </h1>
          <p className="mt-2 text-[#d3c5ac]">Track all events you registered for.</p>
        </header>

        {error ? (
          <EventErrorState>
            <p>{error instanceof Error ? error.message : 'An error occurred while loading your registrations.'}</p>
          </EventErrorState>
        ) : null}

        {isLoading ? (
          <EventLoadingState className="h-[200px]" message="Loading registrations..." />
        ) : registrations.length === 0 ? (
          <EventEmptyState
            className="col-span-full"
            title="No registrations found"
            description="You have not registered for any events yet."
          >
            <div className="mt-6">
                <Link className="font-mono text-xs uppercase tracking-wider text-[#ffe1a7] transition hover:text-[#f9bd22]" to="/events">
                Browse events
              </Link>
            </div>
          </EventEmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {registrations.map((item) => (
              <EventCardShell key={item.registration_id}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h3 className="font-['Hanken_Grotesk'] text-2xl font-semibold text-[#dae2fd]">{item.title}</h3>
                  <EventStatusBadge tone={getEventLifecycleStatus({ endDateTime: item.end_datetime }) === 'Completed' ? 'completed' : 'active'}>
                    {getEventLifecycleStatus({ endDateTime: item.end_datetime })}
                  </EventStatusBadge>
                </div>
                <p className="grow text-base leading-7 text-[#d3c5ac]">{item.description || 'No description provided.'}</p>

                <div className="mt-8 border-t border-[#4f4633] pt-6">
                  <div className="flex flex-col gap-1 text-xs text-[#d3c5ac]">
                    <span>Registered on: {new Date(item.registered_at).toLocaleDateString()}</span>
                    <span>Starts: {new Date(item.start_datetime).toLocaleString()}</span>
                    <span>Ends: {formatEventEndTime(item.end_datetime)}</span>
                    <span>Location: {item.location}</span>
                    <span>Category: {item.category}</span>
                    <span>Status: {item.status}</span>
                    <span>Capacity: {item.capacity}</span>
                  </div>

                  <div className="mt-4 flex items-end justify-end gap-3 pr-1 pb-1">
                    {getEventLifecycleStatus({ endDateTime: item.end_datetime }) === 'Completed' ? (
                      <FeedbackWidget item={item} />
                    ) : (
                      <EventPrimaryLinkButton to={`/events/${item.event_id}/details`}>Details</EventPrimaryLinkButton>
                    )}
                  </div>
                </div>
              </EventCardShell>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FeedbackWidget({ item }: { item: StudentRegistrationEvent }) {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  const feedbackQuery = useQuery<FeedbackRead>({
    queryKey: ['feedback', item.event_id, item.registration_id],
    queryFn: () => getFeedbackForRegistration(item.event_id, item.registration_id),
    enabled: false,
    retry: false,
  })
  const { data: existingFeedback } = feedbackQuery
  const { refetch } = feedbackQuery

  const mutation = useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment?: string }) =>
      submitFeedback(item.event_id, item.registration_id, { rating, comment }),
    onSuccess: () => {
      setSubmitted(true)
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
      addToast(`Thank you! Feedback submitted for "${item.title}"`, 'success')
    },
    onError: (err: unknown) => {
      setFeedbackError(err instanceof Error ? err.message : 'Failed to submit feedback.')
    },
  })

  const startFeedback = async () => {
    try {
      const res = await refetch()
      if (res?.data) {
        setSubmitted(true)
      } else {
        setOpen(true)
      }
    } catch {
      // not found -> allow submit
      setOpen(true)
    }
  }

  if (submitted || existingFeedback) {
    return (
      <span className="inline-flex items-center rounded border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-emerald-200">
        Submitted
      </span>
    )
  }

  return (
    <div className="w-full rounded-xl border border-[#4f4633] bg-[#0b1326] p-4">
      {!open ? (
        <button
          onClick={startFeedback}
          className="inline-flex w-full items-center justify-center rounded-lg border border-[#34daff]/40 bg-[#00a6e0]/20 px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#b6edff] transition hover:bg-[#00a6e0]/30"
        >
          Give Feedback
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setFeedbackError(null)
            mutation.mutate({ rating, comment: comment.trim() || undefined })
          }}
          className="flex w-full flex-col gap-4"
        >
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-medium text-[#dae2fd]">Rating</p>
              <p className="text-xs text-[#d3c5ac]">Choose how you felt about this event</p>
            </div>
            <div className="flex flex-nowrap items-center gap-2 self-start overflow-hidden">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setRating(v)}
                  className={[
                    'inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition',
                    v <= rating
                      ? 'border-[#f9bd22]/60 bg-[#fbbf24]/20 text-[#ffe1a7]'
                      : 'border-[#4f4633] bg-[#131b2e] text-[#d3c5ac] hover:bg-[#222a3d] hover:text-[#ffe1a7]',
                  ].join(' ')}
                  aria-pressed={v === rating}
                  aria-label={`${v} star${v === 1 ? '' : 's'}`}
                >
                  *
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="How did you find it? (optional)"
            className="min-h-[96px] w-full rounded-xl border border-[#4f4633] bg-[#131b2e] p-3 text-sm text-[#dae2fd] outline-none transition placeholder:text-[#d3c5ac]/60 focus:border-[#f9bd22] focus:ring-2 focus:ring-[#f9bd22]/20"
            rows={3}
          />
          {feedbackError ? <p className="w-full text-left text-sm text-[#ffb4ab]">{feedbackError}</p> : null}
          <div className="flex flex-wrap gap-2 self-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-[#4f4633] bg-[#222a3d] px-3 py-2 text-sm font-medium text-[#dae2fd] transition hover:bg-[#2d3449]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-lg bg-[#fbbf24] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#402d00] transition hover:bg-[#f9bd22] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default MyRegistrationsPage
