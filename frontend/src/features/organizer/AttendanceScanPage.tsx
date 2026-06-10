import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Html5Qrcode } from 'html5-qrcode'

import EventPageBackdrop from '../../shared/components/events/EventPageBackdrop'
import { scanQRCode } from '../attendance/attendanceApi'
import { useToast } from '../../context/ToastContext'

type ScanState = 'idle' | 'scanning' | 'success' | 'error'

export default function AttendanceScanPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [cameraStarted, setCameraStarted] = useState(false)
  const { addToast } = useToast()

  const mutation = useMutation({
    mutationFn: (qr_token: string) => scanQRCode(qr_token),
    onSuccess: () => {
      setScanState('success')
      setErrorMsg(null)
      addToast('Attendance marked successfully!', 'success')
    },
    onError: (err: unknown) => {
      setScanState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Failed to mark attendance.')
      addToast(err instanceof Error ? err.message : 'Failed to mark attendance.', 'error')
    },
  })

  const stopScanner = async () => {
    if (scannerRef.current && cameraStarted) {
      try {
        await scannerRef.current.stop()
      } catch {
        // ignore
      }
      setCameraStarted(false)
    }
  }

  const startScanner = async () => {
    setScanState('scanning')
    setLastScanned(null)
    setErrorMsg(null)

    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode('qr-reader')
    }

    try {
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (mutation.isPending) return
          setLastScanned(decodedText)
          await stopScanner()
          mutation.mutate(decodedText)
        },
        () => { /* scan errors are normal, ignore them */ },
      )
      setCameraStarted(true)
    } catch (err) {
      setScanState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Could not access camera.')
    }
  }

  const reset = async () => {
    await stopScanner()
    setScanState('idle')
    setLastScanned(null)
    setErrorMsg(null)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && cameraStarted) {
        scannerRef.current.stop().catch(() => {})
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 md:px-8">
      <EventPageBackdrop />

      <div className="mx-auto w-full max-w-lg">
        <header className="mb-8 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-6 shadow-sm md:p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--primary)]">Organizer Tool</p>
          <h1 className="mt-2 font-['Hanken_Grotesk'] text-4xl font-semibold tracking-tight text-[var(--on-surface)]">
            Scan Attendance
          </h1>
          <p className="mt-2 text-[var(--on-surface-variant)]">
            Scan a student's QR code to mark them as attended.
          </p>
        </header>

        <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-6 shadow-sm">
          {/* Scanner viewport */}
          <div
            id="qr-reader"
            className={[
              'overflow-hidden rounded-xl',
              scanState === 'scanning' ? 'block' : 'hidden',
            ].join(' ')}
          />

          {/* Status feedback */}
          {scanState === 'idle' && (
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--outline-variant)] bg-[var(--surface-container)] text-4xl">
                📷
              </div>
              <p className="text-center text-[var(--on-surface-variant)]">
                Press the button below to open the camera and scan a student's QR code.
              </p>
              <button
                onClick={startScanner}
                className="rounded-xl bg-[var(--primary)] px-8 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-[var(--on-primary)] transition hover:opacity-90"
              >
                Start Scanner
              </button>
            </div>
          )}

          {scanState === 'scanning' && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={reset}
                className="rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-5 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-highest)]"
              >
                Cancel
              </button>
            </div>
          )}

          {(mutation.isPending) && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
              <p className="text-sm text-[var(--on-surface-variant)]">Marking attendance...</p>
            </div>
          )}

          {scanState === 'success' && (
            <div className="flex flex-col items-center gap-5 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10 text-3xl">
                ✓
              </div>
              <div className="text-center">
                <p className="font-['Hanken_Grotesk'] text-lg font-semibold text-[var(--on-surface)]">Attendance Marked!</p>
                {lastScanned ? (
                  <p className="mt-1 font-mono text-[10px] text-[var(--on-surface-variant)] break-all">
                    Token: {lastScanned}
                  </p>
                ) : null}
              </div>
              <button
                onClick={reset}
                className="rounded-xl bg-[var(--primary)] px-8 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-[var(--on-primary)] transition hover:opacity-90"
              >
                Scan Next
              </button>
            </div>
          )}

          {scanState === 'error' && (
            <div className="flex flex-col items-center gap-5 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-red-400/40 bg-red-400/10 text-3xl">
                ✕
              </div>
              <div className="text-center">
                <p className="font-['Hanken_Grotesk'] text-lg font-semibold text-[var(--on-surface)]">Scan Failed</p>
                {errorMsg ? (
                  <p className="mt-1 text-sm text-[var(--error)]">{errorMsg}</p>
                ) : null}
              </div>
              <button
                onClick={reset}
                className="rounded-xl bg-[var(--primary)] px-8 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-[var(--on-primary)] transition hover:opacity-90"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
