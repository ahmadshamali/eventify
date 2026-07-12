import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import EventPageBackdrop from '../../shared/components/events/EventPageBackdrop'
import { fetchMyCertificates } from './certificateApi'

export default function CertificatesPage() {
	const { data: certificates = [], isLoading, error } = useQuery({
		queryKey: ['certificates'],
		queryFn: fetchMyCertificates,
	})

	return (
		<div className="min-h-[calc(100vh-4rem)] px-4 py-8 md:px-8">
			<EventPageBackdrop />
			<div className="mx-auto w-full max-w-[1280px]">
				<header className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-6 shadow-sm md:p-8">
					<p className="font-mono text-xs uppercase tracking-widest text-[var(--primary)]">Eventify</p>
					<h1 className="mt-2 font-['Hanken_Grotesk'] text-4xl font-semibold tracking-tight text-[var(--on-surface)]">Certificates</h1>
					<p className="mt-2 text-[var(--on-surface-variant)]">Open any issued certificate and download the HTML page.</p>
				</header>

				{error ? (
					<div className="mt-5 rounded-xl border border-[var(--error)]/40 bg-[var(--error-container)]/30 p-4 text-[var(--on-error-container)]">
						{error instanceof Error ? error.message : 'An error occurred while loading your certificates.'}
					</div>
				) : null}

				{isLoading ? (
					<div className="mt-5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-6 text-[var(--on-surface-variant)] shadow-sm">
						Loading certificates...
					</div>
				) : certificates.length === 0 ? (
					<div className="mt-5 rounded-xl border border-dashed border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-6 py-12 text-center text-[var(--on-surface-variant)] shadow-sm">
						No certificates are available yet.
					</div>
				) : (
					<div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
						{certificates.map((certificate) => (
							<article key={certificate.attendance_id} className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-5 shadow-sm">
								<p className="font-mono text-[10px] uppercase tracking-wider text-[var(--primary)]">Verified Certificate</p>
								<h2 className="mt-2 truncate font-['Hanken_Grotesk'] text-2xl font-semibold text-[var(--on-surface)]">{certificate.event_title}</h2>
								<p className="mt-3 text-sm leading-6 text-[var(--on-surface-variant)]">Issued to {certificate.student_name}.</p>
								<div className="mt-5">
									<Link
										to={`/certificate/${certificate.attendance_id}`}
										className="inline-flex rounded-lg bg-[var(--primary)] px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-primary)] transition hover:opacity-90"
									>
										{certificate.event_title}
									</Link>
								</div>
							</article>
						))}
					</div>
				)}
			</div>
		</div>
	)
}