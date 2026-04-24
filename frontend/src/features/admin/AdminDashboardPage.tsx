import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Toaster, toast } from 'sonner'
import {
  approvePendingOrganizer,
  deleteAdminEvent,
  deleteAdminUser,
  fetchAdminEvents,
  fetchAdminOverview,
  fetchAdminUsers,
  fetchPendingOrganizers,
  rejectPendingOrganizer,
} from './adminApi'

type Tab = 'pending' | 'users' | 'events'

function MetricCard({ label, value, helper }: { label: string; value: number; helper?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-5 backdrop-blur-md">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      {helper ? <p className="mt-2 text-xs text-slate-400">{helper}</p> : null}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pending')
  const queryClient = useQueryClient()

  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: fetchAdminOverview,
  })

  const { data: pendingOrganizers = [], isLoading: pendingLoading, error: pendingError } = useQuery({
    queryKey: ['admin-pending-organizers'],
    queryFn: fetchPendingOrganizers,
  })

  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAdminUsers,
  })

  const { data: events = [], isLoading: eventsLoading, error: eventsError } = useQuery({
    queryKey: ['admin-events'],
    queryFn: fetchAdminEvents,
  })

  const approveMutation = useMutation({
    mutationFn: approvePendingOrganizer,
    onSuccess: () => {
      toast.success('Organizer approved successfully')
      void queryClient.invalidateQueries({ queryKey: ['admin-pending-organizers'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ organizerUserId, rejectionReason }: { organizerUserId: number; rejectionReason?: string }) =>
      rejectPendingOrganizer(organizerUserId, { rejection_reason: rejectionReason }),
    onSuccess: () => {
      toast.success('Organizer application rejected')
      void queryClient.invalidateQueries({ queryKey: ['admin-pending-organizers'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      toast.success('User deleted successfully')
      void queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-pending-organizers'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-events'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const deleteEventMutation = useMutation({
    mutationFn: deleteAdminEvent,
    onSuccess: () => {
      toast.success('Event deleted successfully')
      void queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      void queryClient.invalidateQueries({ queryKey: ['events'] })
      void queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleDeleteUser = (userId: number, fullName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${fullName} account?`)
    if (!confirmed) {
      return
    }
    deleteUserMutation.mutate(userId)
  }

  const handleDeleteEvent = (eventId: number, title: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${title} event?`)
    if (!confirmed) {
      return
    }
    deleteEventMutation.mutate(eventId)
  }

  const hasAnyError = overviewError || pendingError || usersError || eventsError

  const pendingCount = useMemo(() => {
    if (overview) {
      return overview.pending_approvals
    }
    return pendingOrganizers.length
  }, [overview, pendingOrganizers.length])

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 px-4 py-10 text-slate-50">
      <Toaster position="top-right" richColors />
      <div className="pointer-events-none fixed -left-52 -top-52 h-[600px] w-[600px] rounded-full bg-blue-500/30 blur-[100px]" />
      <div className="pointer-events-none fixed -bottom-52 -right-52 h-[600px] w-[600px] rounded-full bg-cyan-500/20 blur-[100px]" />

      <div className="relative mx-auto w-full max-w-[1200px]">
        <header className="mb-8 rounded-2xl border border-white/10 bg-slate-800/60 p-6 backdrop-blur-md md:p-8">
          <h1 className="mb-2 bg-gradient-to-br from-white to-slate-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-4xl">
            Admin Dashboard
          </h1>
          <p className="text-slate-300">Manage users, events, and organizer approvals.</p>
        </header>

        {hasAnyError ? (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-200">
            {(hasAnyError as Error).message}
          </div>
        ) : null}

        {overviewLoading ? (
          <div className="mb-6 rounded-2xl border border-white/10 bg-slate-800/60 p-6 text-slate-300">Loading metrics...</div>
        ) : (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              label="Total Users"
              value={overview?.total_users ?? 0}
              helper={`${overview?.total_students ?? 0} students, ${overview?.total_organizers ?? 0} organizers`}
            />
            <MetricCard label="Total Events" value={overview?.total_events ?? 0} />
            <MetricCard label="Pending Approvals" value={pendingCount} />
            <MetricCard label="Total Students" value={overview?.total_students ?? 0} />
            <MetricCard label="Total Organizers" value={overview?.total_organizers ?? 0} />
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-800/70 backdrop-blur-md">
          <div className="grid grid-cols-1 border-b border-white/10 md:grid-cols-3">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={[
                'px-5 py-4 text-sm font-medium transition',
                activeTab === 'pending' ? 'bg-cyan-400/20 text-cyan-100' : 'text-slate-300 hover:bg-white/5',
              ].join(' ')}
            >
              Pending Approvals ({pendingOrganizers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={[
                'px-5 py-4 text-sm font-medium transition',
                activeTab === 'users' ? 'bg-cyan-400/20 text-cyan-100' : 'text-slate-300 hover:bg-white/5',
              ].join(' ')}
            >
              Users
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('events')}
              className={[
                'px-5 py-4 text-sm font-medium transition',
                activeTab === 'events' ? 'bg-cyan-400/20 text-cyan-100' : 'text-slate-300 hover:bg-white/5',
              ].join(' ')}
            >
              Events
            </button>
          </div>

          <div className="p-5 md:p-6">
            {activeTab === 'pending' ? (
              pendingLoading ? (
                <p className="text-slate-300">Loading pending organizers...</p>
              ) : pendingOrganizers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/15 bg-slate-900/30 p-8 text-center text-slate-300">
                  No pending organizer approvals.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingOrganizers.map((organizer) => (
                    <div
                      key={organizer.user_id}
                      className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-slate-900/40 p-4 md:flex-row md:items-center"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-white">{organizer.full_name}</h3>
                        <p className="text-sm text-slate-300">{organizer.email}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          Club: {organizer.club_name} | Submitted: {new Date(organizer.submitted_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => approveMutation.mutate(organizer.user_id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="rounded-lg border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectMutation.mutate({ organizerUserId: organizer.user_id })}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="rounded-lg border border-red-400/40 bg-red-500/20 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : null}

            {activeTab === 'users' ? (
              usersLoading ? (
                <p className="text-slate-300">Loading users...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-sm text-slate-400">
                        <th className="px-3 py-3 font-medium">Name</th>
                        <th className="px-3 py-3 font-medium">Email</th>
                        <th className="px-3 py-3 font-medium">Role</th>
                        <th className="px-3 py-3 font-medium">Account Status</th>
                        <th className="px-3 py-3 font-medium">Joined</th>
                        <th className="px-3 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.user_id} className="border-b border-white/5 text-sm text-slate-200 last:border-0">
                          <td className="px-3 py-3">{user.full_name}</td>
                          <td className="px-3 py-3 text-slate-300">{user.email}</td>
                          <td className="px-3 py-3">
                            <span className="rounded-full border border-cyan-300/40 bg-cyan-500/20 px-2.5 py-1 text-xs uppercase tracking-wide text-cyan-100">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs uppercase tracking-wide text-slate-100">
                              {user.account_status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-slate-300">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.user_id, user.full_name)}
                              disabled={deleteUserMutation.isPending}
                              className="rounded-lg border border-red-400/40 bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-100 transition hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : null}

            {activeTab === 'events' ? (
              eventsLoading ? (
                <p className="text-slate-300">Loading events...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-sm text-slate-400">
                        <th className="px-3 py-3 font-medium">Title</th>
                        <th className="px-3 py-3 font-medium">Subtitle</th>
                        <th className="px-3 py-3 font-medium">Created</th>
                        <th className="px-3 py-3 font-medium">Capacity</th>
                        <th className="px-3 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => (
                        <tr key={event.id} className="border-b border-white/5 text-sm text-slate-200 last:border-0">
                          <td className="px-3 py-3">{event.title}</td>
                          <td className="px-3 py-3 text-slate-300">{event.subtitle}</td>
                          <td className="px-3 py-3 text-slate-300">{new Date(event.created_at).toLocaleDateString()}</td>
                          <td className="px-3 py-3 text-slate-300">{event.capacity ?? 'N/A'}</td>
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(event.id, event.title)}
                              disabled={deleteEventMutation.isPending}
                              className="rounded-lg border border-red-400/40 bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-100 transition hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}
