export interface CertificateDetail {
  id: string;
  event_id: number;
  registration_id: number;
  student_id: number;
  organizer_id: number;
  student_name: string;
  organizer_name: string;
  event_title: string;
  issued_at: string;
  event_location: string;
  event_category: string;
  event_start_datetime: string;
  event_end_datetime: string;
  student_email: string;
  organizer_email: string;
  student_role: string | null;
  organizer_role: string | null;
}