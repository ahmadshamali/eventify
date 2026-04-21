export interface AdminOverview {
  total_users: number
  total_students: number
  total_organizers: number
  total_events: number
  pending_approvals: number
}

export interface PendingOrganizer {
  user_id: number
  full_name: string
  email: string
  club_name: string
  submitted_at: string
}

export interface AdminUser {
  user_id: number
  full_name: string
  email: string
  role: 'student' | 'organizer' | 'admin'
  account_status: 'pending' | 'pending_approval' | 'approved' | 'rejected' | 'active' | 'disabled' | 'deleted'
  created_at: string
}

export interface AdminEvent {
  id: number
  title: string
  subtitle: string
  created_at: string
  capacity: number | null
}

export interface RejectOrganizerPayload {
  rejection_reason?: string
}
