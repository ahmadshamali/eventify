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
import { formatEventEndTime, getEventLifecycleStatus } from './eventTime'
import { getFeedbackForRegistration, submitFeedback } from '../feedback/feedbackApi'

function MyRegistrationsPage() {
  const { data: registrations = [], isLoading, error } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: fetchMyRegistrations,
  })

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 text-slate-50">
      <EventPageBackdrop />

      <div className="relative mx-auto w-full max-w-[1200px] px-8 py-16">
        <header className="mb-16 text-center">
          <h1 className="mb-4 bg-gradient-to-br from-white to-slate-300 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
            My Registrations
          </h1>
          <p className="text-xl font-light text-slate-400">Track all events you registered for</p>
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
              <Link className="text-sm text-blue-300 transition hover:text-blue-200" to="/events">
                Browse events
              </Link>
            </div>
          </EventEmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {registrations.map((item) => (
              <EventCardShell key={item.registration_id}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h3 className="text-2xl font-semibold text-white">{item.title}</h3>
                  <EventStatusBadge tone={getEventLifecycleStatus({ endDateTime: item.end_datetime }) === 'Completed' ? 'completed' : 'active'}>
                    {getEventLifecycleStatus({ endDateTime: item.end_datetime })}
                  </EventStatusBadge>
                </div>
                <p className="grow text-base leading-7 text-slate-400">{item.description || 'No description provided.'}</p>

                <div className="mt-8 border-t border-white/5 pt-6">
                  <div className="flex flex-col gap-1 text-xs text-slate-500">
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

function FeedbackWidget({ item }: { item: any }) {
  const queryClient = useQueryClient()
  const { addToast } = useToast()
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  const feedbackQuery = useQuery({
    queryKey: ['feedback', item.event_id, item.registration_id],
    queryFn: () => getFeedbackForRegistration(item.event_id, item.registration_id),
    enabled: false,
    retry: false,
  } as any)
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
    } catch (e) {
      // not found -> allow submit
      setOpen(true)
    }
  }

  if (submitted || existingFeedback) {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100">
        Submitted
      </span>
    )
  }

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-sm">
      {!open ? (
        <button
          onClick={startFeedback}
          className="inline-flex w-full items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 font-semibold text-cyan-100 transition hover:bg-cyan-500/15"
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
              <p className="text-sm font-medium text-slate-200">Rating</p>
              <p className="text-xs text-slate-400">Choose how you felt about this event</p>
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
                      ? 'border-cyan-300/40 bg-cyan-500/20 text-cyan-100 shadow-[0_0_0_1px_rgba(103,232,249,0.15)]'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-slate-200',
                  ].join(' ')}
                  aria-pressed={v === rating}
                  aria-label={`${v} star${v === 1 ? '' : 's'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="How did you find it? (optional)"
            className="min-h-[96px] w-full rounded-xl border border-white/10 bg-slate-800/70 p-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
            rows={3}
          />
          {feedbackError ? <p className="w-full text-left text-sm text-red-300">{feedbackError}</p> : null}
          <div className="flex flex-wrap gap-2 self-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
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