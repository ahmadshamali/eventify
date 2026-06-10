import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../context/ToastContext'
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
    <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-5 shadow-sm">
      <p className="font-mono text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">{label}</p>
      <p className="mt-3 font-['Hanken_Grotesk'] text-4xl font-semibold text-[var(--on-surface)]">{value}</p>
      {helper ? <p className="mt-2 text-xs text-[var(--on-surface-variant)]">{helper}</p> : null}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pending')
  const queryClient = useQueryClient()
  const { addToast } = useToast()

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
      addToast('Organizer approved successfully', 'success')
      void queryClient.invalidateQueries({ queryKey: ['admin-pending-organizers'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error: Error) => {
      addToast(error.message || 'Unable to approve organizer', 'error')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ organizerUserId, rejectionReason }: { organizerUserId: number; rejectionReason?: string }) =>
      rejectPendingOrganizer(organizerUserId, { rejection_reason: rejectionReason }),
    onSuccess: () => {
      addToast('Organizer application rejected', 'success')
      void queryClient.invalidateQueries({ queryKey: ['admin-pending-organizers'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error: Error) => {
      addToast(error.message || 'Unable to reject organizer application', 'error')
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      addToast('User deleted successfully', 'success')
      void queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-pending-organizers'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-events'] })
    },
    onError: (error: Error) => {
      addToast(error.message || 'Unable to delete user', 'error')
    },
  })

  const deleteEventMutation = useMutation({
    mutationFn: deleteAdminEvent,
    onSuccess: () => {
      addToast('Event deleted successfully', 'success')
      void queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-events'] })
      void queryClient.invalidateQueries({ queryKey: ['events'] })
      void queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
    },
    onError: (error: Error) => {
      addToast(error.message || 'Unable to delete event', 'error')
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
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-[1280px]">
        <header className="mb-8 flex flex-col justify-between gap-4 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-6 shadow-sm md:flex-row md:items-end md:p-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--primary)]">University Admin</p>
            <h1 className="mt-2 font-['Hanken_Grotesk'] text-4xl font-semibold tracking-tight text-[var(--on-surface)]">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-[var(--on-surface-variant)]">Manage users, events, and organizer approvals.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-4 py-2 font-mono text-xs uppercase tracking-wider text-[var(--primary)]">
            <span className="material-symbols-outlined text-base" aria-hidden="true">health_and_safety</span>
            Stable
          </span>
        </header>

        {hasAnyError ? (
          <div className="mb-6 rounded-xl border border-[var(--error)]/40 bg-[var(--error-container)]/30 p-4 text-[var(--on-error-container)]">
            {(hasAnyError as Error).message}
          </div>
        ) : null}

        {overviewLoading ? (
          <div className="mb-6 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-6 text-[var(--on-surface-variant)]">Loading metrics...</div>
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

        <section className="overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] shadow-sm">
          <div className="grid grid-cols-1 border-b border-[var(--outline-variant)] md:grid-cols-3">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={[
                'px-5 py-4 font-mono text-xs font-semibold uppercase tracking-wider transition',
                activeTab === 'pending' ? 'bg-[var(--surface-container-high)] text-[var(--primary)]' : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)]',
              ].join(' ')}
            >
              Pending Approvals ({pendingOrganizers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={[
                'px-5 py-4 font-mono text-xs font-semibold uppercase tracking-wider transition',
                activeTab === 'users' ? 'bg-[var(--surface-container-high)] text-[var(--primary)]' : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)]',
              ].join(' ')}
            >
              Users
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('events')}
              className={[
                'px-5 py-4 font-mono text-xs font-semibold uppercase tracking-wider transition',
                activeTab === 'events' ? 'bg-[var(--surface-container-high)] text-[var(--primary)]' : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)]',
              ].join(' ')}
            >
              Events
            </button>
          </div>

          <div className="p-5 md:p-6">
            {activeTab === 'pending' ? (
              pendingLoading ? (
                <p className="text-[var(--on-surface-variant)]">Loading pending organizers...</p>
              ) : pendingOrganizers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--outline-variant)] bg-[var(--background)] p-8 text-center text-[var(--on-surface-variant)]">
                  No pending organizer approvals.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingOrganizers.map((organizer) => (
                    <div
                      key={organizer.user_id}
                      className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--outline-variant)] bg-[var(--background)] p-4 md:flex-row md:items-center"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--on-surface)]">{organizer.full_name}</h3>
                        <p className="text-sm text-[var(--on-surface-variant)]">{organizer.email}</p>
                        <p className="mt-1 text-sm text-[var(--on-surface-variant)]/80">
                          Club: {organizer.club_name} | Submitted: {new Date(organizer.submitted_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => approveMutation.mutate(organizer.user_id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-emerald-200 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectMutation.mutate({ organizerUserId: organizer.user_id })}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="rounded-lg border border-[var(--error)]/40 bg-[var(--error-container)]/30 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-error-container)] transition hover:bg-[var(--error-container)]/50 disabled:cursor-not-allowed disabled:opacity-60"
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
                <p className="text-[var(--on-surface-variant)]">Loading users...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b border-[var(--outline-variant)] text-left font-mono text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">
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
                        <tr key={user.user_id} className="border-b border-[var(--outline-variant)]/70 text-sm text-[var(--on-surface)] last:border-0 hover:bg-[var(--surface-container)]">
                          <td className="px-3 py-3">{user.full_name}</td>
                          <td className="px-3 py-3 text-[var(--on-surface-variant)]">{user.email}</td>
                          <td className="px-3 py-3">
                            <span className="rounded border border-[var(--tertiary-container)]/40 bg-[var(--secondary-container)]/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--tertiary)]">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="rounded border border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--on-surface)]">
                              {user.account_status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-[var(--on-surface-variant)]">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.user_id, user.full_name)}
                              disabled={deleteUserMutation.isPending}
                              className="rounded-lg border border-[var(--error)]/40 bg-[var(--error-container)]/30 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--on-error-container)] transition hover:bg-[var(--error-container)]/50 disabled:cursor-not-allowed disabled:opacity-60"
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
                <p className="text-[var(--on-surface-variant)]">Loading events...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="border-b border-[var(--outline-variant)] text-left font-mono text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">
                        <th className="px-3 py-3 font-medium">Title</th>
                        <th className="px-3 py-3 font-medium">Subtitle</th>
                        <th className="px-3 py-3 font-medium">Created</th>
                        <th className="px-3 py-3 font-medium">Capacity</th>
                        <th className="px-3 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => (
                        <tr key={event.id} className="border-b border-[var(--outline-variant)]/70 text-sm text-[var(--on-surface)] last:border-0 hover:bg-[var(--surface-container)]">
                          <td className="px-3 py-3">{event.title}</td>
                          <td className="px-3 py-3 text-[var(--on-surface-variant)]">{event.subtitle}</td>
                          <td className="px-3 py-3 text-[var(--on-surface-variant)]">{new Date(event.created_at).toLocaleDateString()}</td>
                          <td className="px-3 py-3 text-[var(--on-surface-variant)]">{event.capacity ?? 'N/A'}</td>
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(event.id, event.title)}
                              disabled={deleteEventMutation.isPending}
                              className="rounded-lg border border-[var(--error)]/40 bg-[var(--error-container)]/30 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--on-error-container)] transition hover:bg-[var(--error-container)]/50 disabled:cursor-not-allowed disabled:opacity-60"
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
