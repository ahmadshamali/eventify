import { apiRequest } from '../../lib/axiosClient'

export type Certificate = {
	id: string
	event_id: number
	registration_id: number
	student_id: number
	organizer_id: number
	student_name: string
	organizer_name: string
	event_title: string
	issued_at: string
}

export type CertificateDetail = Certificate & {
	event_location: string
	event_category: string
	event_start_datetime: string
	event_end_datetime: string
	student_email: string
	organizer_email: string
	student_role: string | null
	organizer_role: string | null
}

export type GenerateCertificatesResponse = {
	event_id: number
	total_attended: number
	generated_count: number
}

export const fetchMyCertificates = async (): Promise<Certificate[]> => {
	return apiRequest<Certificate[]>('/certificates/me')
}

export const fetchCertificate = async (certificateId: string): Promise<CertificateDetail> => {
	return apiRequest<CertificateDetail>(`/certificates/${certificateId}`)
}

export const generateEventCertificates = async (eventId: number): Promise<GenerateCertificatesResponse> => {
	return apiRequest<GenerateCertificatesResponse>(`/certificates/events/${eventId}/generate`, {
		method: 'POST',
	})
}