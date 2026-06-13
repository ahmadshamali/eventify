import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import EventPageBackdrop from '../../shared/components/events/EventPageBackdrop'
import { fetchCertificate, fetchMyCertificates } from './certificateApi'

function formatIssuedAt(value: string) {
	return new Date(value).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}

function CertificateCard({
	studentName,
	eventTitle,
	organizerName,
	issuedAt,
	eventLocation,
	eventCategory,
	eventStartDatetime,
	eventEndDatetime,
	showActions = false,
}: {
	studentName: string
	eventTitle: string
	organizerName: string
	issuedAt: string
	eventLocation: string
	eventCategory: string
	eventStartDatetime: string
	eventEndDatetime: string
	showActions?: boolean
}) {
	return (
		<article className="relative overflow-hidden rounded-[28px] border border-[var(--outline-variant)] bg-[linear-gradient(135deg,var(--surface-container-low),var(--surface-container-lowest))] p-6 shadow-sm print:break-after-page">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(96,165,250,0.12),transparent_30%)]" />
			<div className="relative flex items-start justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-high)] text-[var(--primary)]">
						<span className="material-symbols-outlined text-2xl" aria-hidden="true">school</span>
					</div>
					<div>
						<p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--primary)]">Eventify</p>
						<h2 className="font-['Hanken_Grotesk'] text-xl font-semibold text-[var(--on-surface)]">Certificate of Attendance</h2>
					</div>
				</div>
				<span className="rounded-full border border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--on-surface-variant)]">
					Verified
				</span>
			</div>

			<div className="relative mt-8 rounded-[24px] border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-6 md:p-8">
				<p className="font-mono text-[10px] uppercase tracking-[0.36em] text-[var(--on-surface-variant)]">This certifies that</p>
				<p className="mt-4 font-['Hanken_Grotesk'] text-3xl font-semibold tracking-tight text-[var(--on-surface)] md:text-4xl">
					{studentName}
				</p>
				<p className="mt-4 text-base leading-7 text-[var(--on-surface-variant)] md:text-lg">
					has successfully attended <span className="font-semibold text-[var(--on-surface)]">{eventTitle}</span> organized by <span className="font-semibold text-[var(--on-surface)]">{organizerName}</span>.
				</p>

				<div className="mt-8 grid gap-4 border-t border-[var(--outline-variant)] pt-5 sm:grid-cols-2">
					<div>
						<p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--on-surface-variant)]">Student</p>
						<p className="mt-2 text-sm font-medium text-[var(--on-surface)]">{studentName}</p>
					</div>
					<div>
						<p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[var(--on-surface-variant)]">Organized by</p>
						<p className="mt-2 text-sm font-medium text-[var(--on-surface)]">{organizerName}</p>
					</div>
				</div>
			</div>

			<div className="relative mt-6 flex items-center justify-between gap-3 text-xs text-[var(--on-surface-variant)]">
				<span>{eventTitle}</span>
				<span>Issued on {formatIssuedAt(issuedAt)}</span>
			</div>

			<div className="relative mt-4 grid gap-3 border-t border-[var(--outline-variant)] pt-4 text-xs text-[var(--on-surface-variant)] sm:grid-cols-2">
				<span>Location: {eventLocation}</span>
				<span>Category: {eventCategory}</span>
				<span>Starts: {new Date(eventStartDatetime).toLocaleString()}</span>
				<span>Ends: {new Date(eventEndDatetime).toLocaleString()}</span>
			</div>

			{showActions ? (
				<div className="relative mt-5 flex flex-wrap gap-3 print:hidden">
					<button
						type="button"
						onClick={() => window.print()}
						className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-surface)] transition hover:text-[var(--primary)]"
					>
						Print
					</button>
					<Link
						to="/certificates"
						className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-surface)] transition hover:text-[var(--primary)]"
					>
						Back
					</Link>
				</div>
			) : null}
		</article>
	)
}

function CertificateRow({
	id,
	eventTitle,
	organizerName,
}: {
	id: string
	eventTitle: string
	organizerName: string
}) {
	return (
		<div className="flex flex-col gap-4 rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-5 md:flex-row md:items-center md:justify-between">
			<div className="min-w-0">
				<p className="truncate font-['Hanken_Grotesk'] text-lg font-semibold text-[var(--on-surface)]">{eventTitle}</p>
				<p className="mt-1 text-sm text-[var(--on-surface-variant)]">{organizerName}</p>
			</div>
			<Link
				to={`/certificates/${id}`}
				className="inline-flex w-fit items-center justify-center rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-surface)] transition hover:text-[var(--primary)]"
			>
				Show
			</Link>
		</div>
	)
}

export default function CertificatesPage() {
	const { certificateId } = useParams()
	const isDetailPage = Boolean(certificateId)

	const detailQuery = useQuery({
		queryKey: ['certificate', certificateId],
		queryFn: () => fetchCertificate(certificateId!),
		enabled: isDetailPage,
	})

	const { data: certificates = [], isLoading, error } = useQuery({
		queryKey: ['my-certificates'],
		queryFn: fetchMyCertificates,
		enabled: !isDetailPage,
	})

	if (isDetailPage) {
		const certificate = detailQuery.data
		return (
			<div className="min-h-[calc(100vh-4rem)] px-4 py-8 md:px-8">
				<EventPageBackdrop />
				<div className="mx-auto w-full max-w-[1200px]">
					{detailQuery.isLoading ? (
						<div className="rounded-xl border border-dashed border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-6 py-14 text-center text-[var(--on-surface-variant)]">
							Loading certificate...
						</div>
					) : detailQuery.error ? (
						<div className="rounded-xl border border-[var(--error)]/40 bg-[var(--error-container)]/30 p-4 text-[var(--on-error-container)]">
							{detailQuery.error instanceof Error ? detailQuery.error.message : 'An error occurred while loading the certificate.'}
						</div>
					) : certificate ? (
						<CertificateCard
							studentName={certificate.student_name}
							eventTitle={certificate.event_title}
							organizerName={certificate.organizer_name}
							issuedAt={certificate.issued_at}
							eventLocation={certificate.event_location}
							eventCategory={certificate.event_category}
							eventStartDatetime={certificate.event_start_datetime}
							eventEndDatetime={certificate.event_end_datetime}
							showActions
						/>
					) : null}
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-[calc(100vh-4rem)] px-4 py-8 md:px-8">
			<EventPageBackdrop />

			<div className="mx-auto w-full max-w-[1200px]">
				<header className="mb-8 rounded-[28px] border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-6 shadow-sm md:p-8">
					<p className="font-mono text-xs uppercase tracking-widest text-[var(--primary)]">Student Certificates</p>
					<h1 className="mt-2 font-['Hanken_Grotesk'] text-4xl font-semibold tracking-tight text-[var(--on-surface)]">Certificates</h1>
					<p className="mt-2 max-w-2xl text-[var(--on-surface-variant)]">Your earned certificates appear here after an organizer generates them for a completed event.</p>
				</header>

				{error ? (
					<div className="mb-6 rounded-xl border border-[var(--error)]/40 bg-[var(--error-container)]/30 p-4 text-[var(--on-error-container)]">
						{error instanceof Error ? error.message : 'An error occurred while loading your certificates.'}
					</div>
				) : null}

				{isLoading ? (
					<div className="rounded-xl border border-dashed border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-6 py-14 text-center text-[var(--on-surface-variant)]">
						Loading certificates...
					</div>
				) : certificates.length === 0 ? (
					<div className="rounded-xl border border-dashed border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-6 py-14 text-center text-[var(--on-surface-variant)]">
						No certificates have been generated yet.
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4">
						{certificates.map((certificate) => (
							<CertificateRow
								key={certificate.id}
								eventTitle={certificate.event_title}
								organizerName={certificate.organizer_name}
								id={certificate.id}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	)
}