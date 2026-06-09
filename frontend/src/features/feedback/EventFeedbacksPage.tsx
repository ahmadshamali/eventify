import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import EventPageBackdrop from '../../shared/components/events/EventPageBackdrop'
import { fetchFeedbacks } from './feedbackApi'
import type { FeedbackRead } from './feedbackApi'

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((value) => {
        const isFilled = value <= rating
        return (
          <svg
            key={value}
            viewBox="0 0 20 20"
            fill="currentColor"
            className={[
              'h-4 w-4 transition',
              isFilled ? 'text-[var(--primary-fixed-dim)]' : 'text-[var(--outline-variant)]',
            ].join(' ')}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.293a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.196-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.293z" />
          </svg>
        )
      })}
    </div>
  )
}

function EventFeedbacksPage() {
  const { eventId } = useParams()
  const numericId = Number(eventId)

  const { data: feedbacks = [], isLoading, error } = useQuery<FeedbackRead[]>({
    queryKey: ['feedbacks', numericId],
    queryFn: () => fetchFeedbacks(numericId),
    enabled: !!numericId,
  })

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 md:px-8">
      <EventPageBackdrop />

      <div className="mx-auto w-full max-w-[900px]">
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-[var(--primary)] transition hover:text-[var(--primary-fixed-dim)]">
            <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_back</span>
            Back to dashboard
          </Link>
        </div>

        <header className="mb-8 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-6 shadow-sm md:p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--primary)]">Organizer Insights</p>
          <h1 className="mt-2 font-['Hanken_Grotesk'] text-4xl font-semibold text-[var(--on-surface)]">
            Event Feedbacks
          </h1>
          <p className="mt-2 text-[var(--on-surface-variant)]">Anonymous feedback submitted by participants.</p>
        </header>

        {isLoading ? (
          <div className="text-center text-[var(--on-surface-variant)]">Loading feedbacks...</div>
        ) : error ? (
          <div className="rounded-xl border border-[var(--error)]/40 bg-[var(--error-container)]/30 p-4 text-[var(--on-error-container)]">{(error as Error)?.message || 'Failed to load feedbacks'}</div>
        ) : feedbacks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-8 py-16 text-center text-[var(--on-surface-variant)]">No feedbacks yet</div>
        ) : (
          <div className="flex flex-col gap-4">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-[var(--on-surface)]">{fb.full_name}</div>
                    <div className="flex items-center gap-3">
                      <RatingStars rating={fb.rating} />
                      <span className="text-sm font-semibold text-[var(--primary)]">{fb.rating} / 5</span>
                    </div>
                  </div>
                  <div className="text-xs text-[var(--on-surface-variant)]">{new Date(fb.created_at).toLocaleString()}</div>
                </div>
                <div className="text-[var(--on-surface)]">{fb.comment || <span className="text-[var(--on-surface-variant)]">No comment provided.</span>}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventFeedbacksPage
