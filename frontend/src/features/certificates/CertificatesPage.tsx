import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Award, ArrowUpRight, Inbox, AlertCircle } from 'lucide-react';
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

        {/* Header */}
        <header className="relative overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-6 shadow-sm md:p-8">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--primary)]/5" />
            <div className="relative flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-[var(--primary)]">Eventify</p>
                    <h1 className="mt-2 font-['Hanken_Grotesk'] text-4xl font-semibold tracking-tight text-[var(--on-surface)]">
                        Certificates
                    </h1>
                    <p className="mt-2 text-[var(--on-surface-variant)]">
                        Open any issued certificate and download it as a PDF.
                    </p>
                </div>
                {!isLoading && certificates.length > 0 && (
                    <div className="flex items-center gap-2 rounded-full border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-2 font-mono text-xs uppercase tracking-wider text-[var(--on-surface-variant)]">
                        <Award size={14} className="text-[var(--primary)]" />
                        {certificates.length} issued
                    </div>
                )}
            </div>
        </header>

        {/* Error state */}
        {error ? (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-[var(--error)]/40 bg-[var(--error-container)]/30 p-4 text-[var(--on-error-container)]">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error instanceof Error ? error.message : 'An error occurred while loading your certificates.'}</span>
            </div>
        ) : null}

        {/* Loading state */}
        {isLoading ? (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-44 animate-pulse rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)]" />
                ))}
            </div>
        ) : certificates.length === 0 ? (
            /* Empty state */
            <div className="mt-5 flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-6 py-14 text-center shadow-sm">
                <Inbox size={28} className="text-[var(--on-surface-variant)]" />
                <p className="text-[var(--on-surface-variant)]">No certificates are available yet.</p>
            </div>
        ) : (
            /* Certificate cards */
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {certificates.map((certificate) => (
                    <article
                        key={certificate.attendance_id}
                        className="group relative overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                        {/* gold accent bar */}
                        <div className="h-1 w-full bg-gradient-to-r from-[var(--primary)] via-[var(--primary)]/60 to-transparent" />

                        <div className="p-5">
                            <div className="flex items-center justify-between">
                                <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--primary)]">
                                    Verified Certificate
                                </p>
                                <Award size={16} className="text-[var(--primary)]/70" />
                            </div>

                            <h2 className="mt-2 line-clamp-2 font-['Hanken_Grotesk'] text-xl font-semibold leading-snug text-[var(--on-surface)]">
                                {certificate.event_title}
                            </h2>

                            <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
                                Issued to <span className="font-medium text-[var(--on-surface)]">{certificate.student_name}</span>
                            </p>

                            <Link
                                to={`/certificate/${certificate.attendance_id}`}
                                className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-primary)] transition hover:opacity-90"
                            >
                                View certificate
                                <ArrowUpRight size={14} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
