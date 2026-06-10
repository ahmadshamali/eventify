export type UserRole = 'student' | 'organizer'

export interface LoginRequest {
  email: string
  password: string
}

export interface VerifyEmailRequest {
  code: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest extends ForgotPasswordRequest {
  code: string
  new_password: string
}

export interface MessageResponse {
  message: string
}

export interface StudentProfilePayload {
  major: string
}

export interface OrganizerProfilePayload {
  club_name: string
}

export type RegisterRequest =
  | {
      full_name: string
      email: string
      password: string
      role: 'student'
      student_profile: StudentProfilePayload
      organizer_profile?: never
    }
  | {
      full_name: string
      email: string
      password: string
      role: 'organizer'
      organizer_profile: OrganizerProfilePayload
      student_profile?: never
    }

export interface Role {
  role_id: number
  role_name: UserRole
}

export interface StudentProfile {
  student_id: number
  student_number: string
  major: string
  created_at: string
}

export interface OrganizerProfile {
  organizer_id: number
  club_name: string
  approved_by: number | null
  approved_at: string | null
  rejection_reason: string | null
  created_at: string
}

export interface User {
  user_id: number
  email: string
  full_name: string
  email_verified: boolean
  account_status: 'pending' | 'pending_approval' | 'approved' | 'rejected' | 'active' | 'disabled' | 'deleted'
  permanent_qr_token: string | null
  created_at: string
  updated_at: string
  role: Role | null
  student_profile: StudentProfile | null
  organizer_profile: OrganizerProfile | null
}

export interface LoginResponse {
  user: User
  access_token: string
  token_type: 'bearer'
}
