export interface CertificateRead {
	attendance_id: number
	event_id: number
	event_title: string
	event_date: string
	organization_name: string
	student_id: number
	student_name: string
	student_email: string
	attended_at: string
	certificate_issued_at: string
	verification_url: string
}

export interface CertificateGenerationResult {
	event_id: number
	event_title: string
	generated_count: number
	total_attended: number
}