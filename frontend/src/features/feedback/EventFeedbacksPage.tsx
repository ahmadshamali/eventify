import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchFeedbacks } from './feedbackApi'
import type { FeedbackRead } from './feedbackApi'

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
      <div className="pointer-events-none fixed -left-52 -top-52 h-[600px] w-[600px] rounded-full bg-blue-500/35 blur-[100px]" />
      <div className="pointer-events-none fixed -bottom-52 -right-52 h-[600px] w-[600px] rounded-full bg-cyan-500/25 blur-[100px]" />

      <div className="relative mx-auto w-full max-w-[900px] px-8 py-16">
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold">Feedbacks</h1>
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
              <div key={fb.id} className="rounded-lg border border-white/10 bg-slate-800/60 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-semibold">{fb.rating} / 5</div>
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
