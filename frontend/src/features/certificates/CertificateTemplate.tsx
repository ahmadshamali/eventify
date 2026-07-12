import { renderToStaticMarkup } from 'react-dom/server'
import { QRCodeSVG } from 'qrcode.react'

import type { CertificateRead } from './certificate.types'

function formatDateTime(value: string): string {
	return new Date(value).toLocaleString()
}

export function buildCertificateHtml(certificate: CertificateRead): string {
	const qrMarkup = renderToStaticMarkup(<QRCodeSVG value={certificate.verification_url} size={220} level="H" includeMargin />)

	return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${certificate.event_title} certificate</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #08111f;
      --panel: #111b31;
      --gold: #f4c15d;
      --text: #f8f2e8;
      --muted: #b8c4da;
      --line: rgba(244, 193, 93, 0.32);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 32px;
      background: radial-gradient(circle at top, rgba(244,193,93,0.12), transparent 28%), linear-gradient(180deg, #06101c, var(--bg));
      color: var(--text);
      font-family: Arial, sans-serif;
    }
    .card {
      width: min(900px, 100%);
      border: 1px solid var(--line);
      border-radius: 28px;
      background: linear-gradient(180deg, rgba(17, 27, 49, 0.98), rgba(8, 17, 31, 0.98));
      padding: 40px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.35);
    }
    .eyebrow {
      margin: 0;
      color: var(--gold);
      text-transform: uppercase;
      letter-spacing: .3em;
      font-size: 12px;
      font-weight: 700;
    }
    h1 { margin: 14px 0 0; font-size: 42px; line-height: 1.05; }
    .subtitle { margin: 12px 0 0; color: var(--muted); font-size: 18px; }
    .grid { display: grid; grid-template-columns: 1.5fr .9fr; gap: 22px; margin-top: 28px; }
    .panel {
      border: 1px solid rgba(244,193,93,0.22);
      border-radius: 22px;
      background: rgba(255,255,255,0.03);
      padding: 24px;
    }
    .label {
      margin: 0 0 10px;
      color: var(--gold);
      text-transform: uppercase;
      letter-spacing: .22em;
      font-size: 11px;
    }
    .meta { margin-top: 22px; display: grid; gap: 8px; color: var(--muted); font-size: 14px; }
    .qr { display: grid; place-items: center; }
    .qrbox { background: #fff; border-radius: 18px; padding: 14px; }
    .verify { margin-top: 14px; color: var(--muted); font-size: 12px; word-break: break-all; }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid rgba(244,193,93,0.16);
      display: flex;
      justify-content: space-between;
      gap: 12px;
      color: var(--muted);
      font-size: 12px;
    }
    @media (max-width: 720px) {
      .card { padding: 24px; }
      .grid { grid-template-columns: 1fr; }
      h1 { font-size: 30px; }
    }
  </style>
</head>
<body>
  <main class="card">
    <p class="eyebrow">Verified Certificate</p>
    <h1>${certificate.student_name}</h1>
    <p class="subtitle">Successfully attended ${certificate.event_title}.</p>
    <section class="grid">
      <div class="panel">
        <p class="label">Certificate of Participation</p>
        <div class="meta">
          <span><strong>Student:</strong> ${certificate.student_name}</span>
          <span><strong>Email:</strong> ${certificate.student_email}</span>
          <span><strong>Attended:</strong> ${formatDateTime(certificate.attended_at)}</span>
          <span><strong>Issued:</strong> ${formatDateTime(certificate.certificate_issued_at)}</span>
          <span><strong>Attendance ID:</strong> ${certificate.attendance_id}</span>
        </div>
      </div>
      <div class="panel qr">
        <p class="label">Verification</p>
        <div class="qrbox">${qrMarkup}</div>
        <p class="verify">${certificate.verification_url}</p>
      </div>
    </section>
    <div class="footer">
      <span>Eventify University Admin</span>
      <span>Digitally verifiable certificate</span>
    </div>
  </main>
</body>
</html>`
}

export function triggerCertificateDownload(certificate: CertificateRead) {
	const blob = new Blob([buildCertificateHtml(certificate)], { type: 'text/html;charset=utf-8' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = `certificate-${certificate.event_title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${certificate.attendance_id}.html`
	document.body.appendChild(link)
	link.click()
	link.remove()
	URL.revokeObjectURL(url)
}

export default function CertificateTemplate({ certificate, onDownload }: { certificate: CertificateRead; onDownload: () => void }) {
	return (
		<section className="rounded-[28px] border border-[rgba(244,193,93,0.28)] bg-[linear-gradient(180deg,rgba(22,34,61,0.96),rgba(10,18,34,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-8">
			<div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
				<div className="min-w-0 flex-1 rounded-[24px] border border-[rgba(244,193,93,0.18)] bg-[var(--surface-container-low)] p-6 md:p-8">
					<p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--primary)]">Certificate of Participation</p>
					<h2 className="mt-4 truncate font-['Hanken_Grotesk'] text-3xl font-semibold text-[var(--on-surface)] md:text-4xl">{certificate.student_name}</h2>
					<p className="mt-3 text-lg text-[var(--on-surface-variant)]">
						Successfully attended <span className="font-semibold text-[var(--on-surface)]">{certificate.event_title}</span>.
					</p>

					<div className="mt-6 grid gap-3 text-sm text-[var(--on-surface-variant)] sm:grid-cols-2">
						<p><span className="text-[var(--primary)]">Student email:</span> {certificate.student_email}</p>
						<p><span className="text-[var(--primary)]">Attended:</span> {new Date(certificate.attended_at).toLocaleString()}</p>
						<p><span className="text-[var(--primary)]">Issued:</span> {new Date(certificate.certificate_issued_at).toLocaleString()}</p>
						<p className="break-all"><span className="text-[var(--primary)]">Attendance ID:</span> {certificate.attendance_id}</p>
					</div>

					<div className="mt-8 flex flex-wrap gap-3">
						<button
							type="button"
							onClick={onDownload}
							className="rounded-lg bg-[var(--primary)] px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-primary)] transition hover:opacity-90"
						>
							Download HTML
						</button>
					</div>
				</div>

				<div className="flex w-full max-w-[280px] flex-col justify-between rounded-[24px] border border-[rgba(244,193,93,0.18)] bg-[var(--surface-container-low)] p-6">
					<div>
						<p className="font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--primary)]">Verification</p>
						<div className="mt-5 rounded-2xl bg-white p-4 shadow-inner">
							<QRCodeSVG value={certificate.verification_url} size={220} level="H" includeMargin={false} className="h-auto w-full" />
						</div>
					</div>
					<p className="mt-4 break-all font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--on-surface-variant)]">
						{certificate.verification_url}
					</p>
				</div>
			</div>
		</section>
	)
}