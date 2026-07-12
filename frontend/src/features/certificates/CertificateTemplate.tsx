import { renderToStaticMarkup } from 'react-dom/server'
import { QRCodeSVG } from 'qrcode.react'

import type { CertificateRead } from './certificate.types'

function formatDateTime(value: string): string {
	return new Date(value).toLocaleString()
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString()
}

export function buildCertificateHtml(certificate: CertificateRead): string {
  const qrMarkup = renderToStaticMarkup(<QRCodeSVG value={certificate.verification_url} size={104} level="H" includeMargin />)
  const certificateText = `This certificate is proudly presented to <span class="recipient-inline">${certificate.student_name}</span> in recognition of their participation in <span class="event-inline">${certificate.event_title}</span>, organized by <span class="organizer-inline">${certificate.organization_name}</span> on <span class="date-inline">${formatDate(certificate.event_date)}</span>. We appreciate their valuable participation and wish them continued success.`

	return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${certificate.event_title} certificate</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap');
    :root {
      color-scheme: dark;
      --bg: #08111f;
      --panel: #111b31;
      --gold: #f4c15d;
      --gold-soft: #ffe6ad;
      --ink: #d7e6ff;
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
    @page {
      size: A4 landscape;
      margin: 14mm;
    }
    .card {
      width: min(900px, 100%);
      border: 1px solid var(--line);
      border-radius: 28px;
      background: linear-gradient(180deg, rgba(17, 27, 49, 0.98), rgba(8, 17, 31, 0.98));
      padding: 40px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.35);
      position: relative;
      padding-right: 188px;
      padding-bottom: 124px;
      overflow: hidden;
      text-align: center;
    }
    .card::before,
    .card::after {
      content: "";
      position: absolute;
      pointer-events: none;
    }
    .card::before {
      inset: 18px;
      border: 1px solid rgba(244, 193, 93, 0.34);
      border-radius: 20px;
    }
    .card::after {
      top: 22px;
      right: 24px;
      width: 170px;
      height: 170px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(244,193,93,0.18), transparent 64%);
    }
    .eyebrow {
      margin: 0;
      color: var(--gold);
      text-transform: uppercase;
      letter-spacing: .3em;
      font-size: 12px;
      font-weight: 700;
      position: relative;
      z-index: 1;
    }
    .eyebrow::after {
      content: "";
      display: block;
      width: 92px;
      height: 2px;
      margin-top: 16px;
      background: linear-gradient(90deg, var(--gold), transparent);
    }
    h1 {
      position: relative;
      z-index: 1;
      width: fit-content;
      margin: 24px 0 0;
      margin-right: auto;
      margin-left: auto;
      color: #ffffff;
      font-family: 'DM Serif Display', Georgia, 'Times New Roman', serif;
      font-size: 58px;
      font-weight: 500;
      line-height: 1.05;
      text-shadow: 0 10px 30px rgba(255, 255, 255, 0.14);
    }
    h1::after {
      content: "";
      position: absolute;
      right: 2px;
      bottom: -10px;
      left: 2px;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--gold), transparent);
    }
    .body-copy {
      position: relative;
      z-index: 1;
      margin-top: 24px;
      color: var(--muted);
      font-size: 18px;
      line-height: 1.8;
      max-width: 760px;
      margin-right: auto;
      margin-left: auto;
    }
    .body-copy p { margin: 0; }
    .recipient-inline,
    .organizer-inline,
    .event-inline,
    .date-inline {
      color: var(--gold-soft);
      font-weight: 700;
    }
    .recipient-inline,
    .event-inline,
    .organizer-inline {
      color: #ffffff;
      font-family: 'DM Serif Display', Georgia, 'Times New Roman', serif;
      letter-spacing: .01em;
      font-size: 1.2em;
      font-weight: 500;
    }
    .meta {
      position: relative;
      z-index: 1;
      margin-top: 28px;
      display: grid;
      gap: 8px;
      color: var(--muted);
      font-size: 14px;
      justify-items: center;
    }
    .qr-corner {
      position: absolute;
      z-index: 1;
      right: 34px;
      bottom: 34px;
      border: 1px solid rgba(244,193,93,0.22);
      border-radius: 14px;
      background: rgba(255,255,255,0.03);
      padding: 10px;
    }
    .qrbox { background: #fff; border-radius: 10px; padding: 8px; }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid rgba(244,193,93,0.16);
      color: var(--muted);
      font-size: 12px;
    }
    @media (max-width: 720px) {
      .card { padding: 24px; padding-right: 24px; padding-bottom: 24px; }
      h1 { font-size: 38px; }
      .body-copy { font-size: 16px; }
      .qr-corner {
        position: static;
        margin-top: 16px;
        width: fit-content;
      }
    }
    @media print {
      body {
        min-height: auto;
        padding: 0;
        background: #08111f;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      .card {
        width: 100%;
        min-height: calc(100vh - 28mm);
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <main class="card">
    <p class="eyebrow">Certificate of Participation</p>
    <h1>${certificate.student_name}</h1>
    <section class="body-copy">
      <p>${certificateText}</p>
    </section>
    <div class="meta">
      <span><strong>Certificate ID:</strong> ${certificate.attendance_id}</span>
      <span><strong>Date of Issue:</strong> ${formatDateTime(certificate.certificate_issued_at)}</span>
    </div>
    <div class="qr-corner">
      <div class="qrbox">${qrMarkup}</div>
    </div>
    <div class="footer">
      <span>Digitally verifiable certificate</span>
    </div>
  </main>
</body>
</html>`
}

export function triggerCertificateDownload(certificate: CertificateRead) {
	const printFrame = document.createElement('iframe')
	printFrame.style.position = 'fixed'
	printFrame.style.right = '0'
	printFrame.style.bottom = '0'
	printFrame.style.width = '0'
	printFrame.style.height = '0'
	printFrame.style.border = '0'
	printFrame.title = `${certificate.event_title} certificate PDF`
	document.body.appendChild(printFrame)

	const printDocument = printFrame.contentWindow?.document
	if (!printDocument) {
		printFrame.remove()
		return
	}

	printDocument.open()
	printDocument.write(buildCertificateHtml(certificate))
	printDocument.close()

	printFrame.onload = () => {
		printFrame.contentWindow?.focus()
		printFrame.contentWindow?.print()
		setTimeout(() => printFrame.remove(), 1000)
	}
}

export default function CertificateTemplate({ certificate, onDownload }: { certificate: CertificateRead; onDownload: () => void }) {
	return (
    <section className="rounded-[28px] border border-[rgba(244,193,93,0.34)] bg-[radial-gradient(circle_at_top_right,rgba(244,193,93,0.14),transparent_32%),linear-gradient(180deg,rgba(22,34,61,0.96),rgba(10,18,34,0.98))] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-8">
      <div className="relative overflow-hidden rounded-[24px] border border-[rgba(244,193,93,0.24)] bg-[linear-gradient(145deg,rgba(17,27,49,0.98),rgba(8,17,31,0.98))] p-6 before:pointer-events-none before:absolute before:inset-4 before:rounded-[18px] before:border before:border-[rgba(244,193,93,0.28)] after:pointer-events-none after:absolute after:right-5 after:top-5 after:h-40 after:w-40 after:rounded-full after:bg-[radial-gradient(circle,rgba(244,193,93,0.18),transparent_64%)] md:p-8 md:pb-36 md:pr-44">
        <p className="relative z-[1] font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--primary)] after:mt-4 after:block after:h-0.5 after:w-24 after:bg-[linear-gradient(90deg,var(--primary),transparent)]">Certificate of Participation</p>
        <h2 className="relative z-[1] mx-auto mt-6 w-fit font-['DM_Serif_Display',Georgia,serif] text-4xl font-medium leading-tight text-white text-shadow-lg md:text-6xl">
          {certificate.student_name}
          <span className="absolute -bottom-2 left-0 h-0.5 w-full bg-[linear-gradient(90deg,transparent,var(--primary),transparent)]" />
        </h2>
        <p className="relative z-[1] mx-auto mt-8 max-w-[760px] text-lg leading-8 text-[var(--on-surface-variant)]">
          This certificate is proudly presented to <span className="font-['DM_Serif_Display',Georgia,serif] text-[1.2em] font-medium tracking-wide text-white">{certificate.student_name}</span> in recognition of their participation in <span className="font-['DM_Serif_Display',Georgia,serif] text-[1.2em] font-medium tracking-wide text-white">{certificate.event_title}</span>, organized by <span className="font-['DM_Serif_Display',Georgia,serif] text-[1.2em] font-medium tracking-wide text-white">{certificate.organization_name}</span> on <span className="font-semibold text-[#ffe6ad]">{new Date(certificate.event_date).toLocaleDateString()}</span>. We appreciate their valuable participation and wish them continued success.
        </p>

        <div className="relative z-[1] mt-8 grid justify-items-center gap-2 text-sm text-[var(--on-surface-variant)]">
          <p><span className="text-[var(--primary)]">Certificate ID:</span> {certificate.attendance_id}</p>
          <p><span className="text-[var(--primary)]">Date of Issue:</span> {new Date(certificate.certificate_issued_at).toLocaleString()}</p>
        </div>

        <div className="relative z-[1] mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onDownload}
            className="rounded-lg bg-[var(--primary)] px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-primary)] shadow-[0_10px_26px_rgba(244,193,93,0.18)] transition hover:opacity-90"
          >
            Download PDF
          </button>
        </div>

        <div className="relative z-[1] mt-6 ml-auto w-fit rounded-xl border border-[rgba(244,193,93,0.18)] bg-[var(--surface-container-low)] p-2 md:absolute md:right-6 md:bottom-6 md:mt-0">
          <div className="rounded-lg bg-white p-2 shadow-inner">
            <QRCodeSVG value={certificate.verification_url} size={104} level="H" includeMargin={false} className="h-auto w-[104px]" />
          </div>
        </div>
      </div>
    </section>
	)
}
