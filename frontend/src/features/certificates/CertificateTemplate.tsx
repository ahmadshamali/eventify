import type { CertificateDetail } from './certificate.types.ts'

export default function CertificateTemplate({ cert }: { cert: CertificateDetail }) {
  const issueDate = new Date(cert.issued_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="relative aspect-[1.414/1] w-full overflow-hidden rounded-2xl border-[12px] border-[var(--primary-fixed-dim)] bg-[var(--surface-container-low)] p-12 text-center shadow-2xl">
      {/* Background Decor */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--primary)] opacity-5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[var(--tertiary)] opacity-5 blur-3xl" />
      
      {/* Border Inset */}
      <div className="absolute inset-4 rounded-lg border border-[var(--outline-variant)] opacity-30" />

      <header className="mb-8">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--primary-container)] text-4xl shadow-inner">
          🎖️
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--primary)]">Certificate of Participation</p>
      </header>

      <main className="flex flex-col gap-6">
        <p className="text-[var(--on-surface-variant)]">This is to certify that</p>
        <h2 className="font-['Hanken_Grotesk'] text-5xl font-bold tracking-tight text-[var(--on-surface)]">
          {cert.student_name}
        </h2>
        <p className="mx-auto max-w-lg text-[var(--on-surface-variant)]">
          has successfully attended and completed the university event
        </p>
        <h3 className="font-['Hanken_Grotesk'] text-2xl font-semibold text-[var(--primary)]">
          {cert.event_title}
        </h3>
      </main>

      <footer className="mt-16 flex items-end justify-between px-8">
        <div className="text-left">
          <p className="font-mono text-[10px] uppercase text-[var(--on-surface-variant)]">Issued On</p>
          <p className="font-semibold text-[var(--on-surface)]">{issueDate}</p>
        </div>
        
        <div className="text-center">
          <div className="mb-1 h-px w-32 bg-[var(--outline-variant)]" />
          <p className="text-sm font-medium text-[var(--on-surface)]">{cert.organizer_name}</p>
          <p className="font-mono text-[10px] uppercase text-[var(--on-surface-variant)]">Event Organizer</p>
        </div>

        <div className="text-right font-mono text-[8px] text-[var(--outline)] uppercase">
          ID: {cert.id.split('-')[0]}
        </div>
      </footer>
    </div>
  )
}