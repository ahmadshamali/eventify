import { apiRequest } from '../../lib/axiosClient'

export interface AttendanceRecord {
  id: number
  registration_id: number
  event_id: number
  student_id: number
  scanned_by: number
  attended_at: string
}

export interface AttendanceStudentRecord {
  attendance_id: number
  student_id: number
  full_name: string
  email: string
  attended_at: string
}

export const scanQRCode = async (qr_token: string): Promise<AttendanceRecord> => {
  return apiRequest<AttendanceRecord>('/attendance/scan', {
    method: 'POST',
    body: JSON.stringify({ qr_token }),
  })
}

export const fetchEventAttendance = async (eventId: number): Promise<AttendanceStudentRecord[]> => {
  return apiRequest<AttendanceStudentRecord[]>(`/attendance/event/${eventId}`)
}
