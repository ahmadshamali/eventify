import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import EventPageBackdrop from '../../shared/components/events/EventPageBackdrop'
import { fetchCertificate } from './certificateApi'
import CertificateTemplate, { triggerCertificateDownload } from './CertificateTemplate'

export default function CertificateDetailPage() {
	const { attendanceId } = useParams()
	const parsedAttendanceId = attendanceId ? Number(attendanceId) : NaN
	const { data: certificate, isLoading, error } = useQuery({
		queryKey: ['certificate', parsedAttendanceId],
		queryFn: () => fetchCertificate(parsedAttendanceId),
		enabled: Number.isFinite(parsedAttendanceId),
	})

	return (
		<div className="min-h-[calc(100vh-4rem)] px-4 py-8 md:px-8">
			<EventPageBackdrop />
			<div className="mx-auto w-full max-w-[1100px]">
				{error ? (
					<div className="rounded-xl border border-[var(--error)]/40 bg-[var(--error-container)]/30 p-4 text-[var(--on-error-container)]">
						{error instanceof Error ? error.message : 'Unable to load certificate.'}
					</div>
				) : null}

				{isLoading ? (
					<div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-6 text-[var(--on-surface-variant)] shadow-sm">
						Loading certificate...
					</div>
				) : certificate ? (
					<CertificateTemplate
						certificate={certificate}
						onDownload={() => triggerCertificateDownload(certificate)}
					/>
				) : null}
			</div>
		</div>
	)
}
