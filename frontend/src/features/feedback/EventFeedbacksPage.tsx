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
              isFilled ? 'text-cyan-300' : 'text-slate-600',
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
    <div className="relative min-h-screen overflow-hidden bg-slate-900 text-slate-50">
      <EventPageBackdrop />

      <div className="relative mx-auto w-full max-w-[900px] px-8 py-16">
        <div className="mb-6">
          <Link to="/dashboard" className="text-sm text-blue-300 transition hover:text-blue-200">
            Back to dashboard
          </Link>
        </div>

        <header className="mb-8 rounded-2xl border border-white/10 bg-slate-800/60 p-6 text-center backdrop-blur-md md:p-8">
          <h1 className="mb-2 bg-gradient-to-br from-white to-slate-300 bg-clip-text text-4xl font-bold text-transparent">
            Event Feedbacks
          </h1>
          <p className="text-slate-400">Anonymous feedback submitted by participants</p>
        </header>

        {isLoading ? (
          <div className="text-center text-slate-400">Loading feedbacks...</div>
        ) : error ? (
          <div className="text-red-400">{(error as Error)?.message || 'Failed to load feedbacks'}</div>
        ) : feedbacks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-800/60 px-8 py-16 text-center">No feedbacks yet</div>
        ) : (
          <div className="flex flex-col gap-4">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="rounded-xl border border-white/10 bg-slate-800/60 p-5 backdrop-blur-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-white">{fb.full_name}</div>
                    <div className="flex items-center gap-3">
                      <RatingStars rating={fb.rating} />
                      <span className="text-sm font-semibold text-cyan-100">{fb.rating} / 5</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">{new Date(fb.created_at).toLocaleString()}</div>
                </div>
                <div className="text-slate-200">{fb.comment || <span className="text-slate-400">No comment provided.</span>}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventFeedbacksPage
