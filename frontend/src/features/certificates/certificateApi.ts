import { apiRequest } from '../../lib/axiosClient'
import type { CertificateGenerationResult, CertificateRead } from './certificate.types'

export const fetchMyCertificates = async (): Promise<CertificateRead[]> => {
	return apiRequest<CertificateRead[]>('/certificates/my-certificates')
}

export const fetchCertificate = async (attendanceId: number): Promise<CertificateRead> => {
	return apiRequest<CertificateRead>(`/certificates/${attendanceId}`)
}

export const generateCertificatesForEvent = async (eventId: number): Promise<CertificateGenerationResult> => {
	return apiRequest<CertificateGenerationResult>(`/certificates/events/${eventId}/generate`, {
		method: 'POST',
	})
}