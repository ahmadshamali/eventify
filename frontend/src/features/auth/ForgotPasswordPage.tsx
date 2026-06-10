import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import * as z from 'zod'

import { forgotPassword, verifyResetCode } from './authApi'
import type { ForgotPasswordRequest, VerifyResetCodeRequest } from './auth.types'
import Button from '../../shared/components/Button'
import Input from '../../shared/components/Input'
import StatusMessage from '../../shared/components/StatusMessage'

const allowedEmailDomain = /@(student|staff)\.birzeit\.edu$/i
const RESEND_COOLDOWN_SECONDS = 60

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Invalid email address' })
    .refine((value) => allowedEmailDomain.test(value), {
      message: 'Email must end with @student.birzeit.edu or @staff.birzeit.edu',
    }),
})

const codeSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, { message: 'Reset code must be a 6-digit number' }),
})

type EmailFormState = z.infer<typeof emailSchema>
type CodeFormState = z.infer<typeof codeSchema>

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [resendSeconds, setResendSeconds] = useState(0)

  const emailForm = useForm<EmailFormState>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  })

  const codeForm = useForm<CodeFormState>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  })

  const requestMutation = useMutation({
    mutationFn: (payload: ForgotPasswordRequest) => forgotPassword(payload),
    onSuccess: (_, payload) => {
      setEmail(payload.email)
      setResendSeconds(RESEND_COOLDOWN_SECONDS)
    },
  })

  const verifyMutation = useMutation({
    mutationFn: (payload: VerifyResetCodeRequest) => verifyResetCode(payload),
    onSuccess: (_, payload) => {
      navigate('/reset-password', {
        state: { email: payload.email, code: payload.code },
      })
    },
  })

  useEffect(() => {
    if (resendSeconds <= 0) return undefined

    const timer = window.setInterval(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [resendSeconds])

  const onRequestCode: SubmitHandler<EmailFormState> = (data) => {
    return requestMutation.mutateAsync({ email: data.email.trim().toLowerCase() })
  }

  const onVerifyCode: SubmitHandler<CodeFormState> = (data) => {
    return verifyMutation.mutateAsync({ email, code: data.code.trim() })
  }

  const requestAnotherCode = () => {
    verifyMutation.reset()
    codeForm.reset()
    requestMutation.mutate({ email })
  }

  const useAnotherEmail = () => {
    setEmail('')
    setResendSeconds(0)
    requestMutation.reset()
    verifyMutation.reset()
    codeForm.reset()
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--background)] px-4 py-8 text-[var(--on-surface)]">
      <section className="grid w-full max-w-[900px] grid-cols-1 overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] shadow-2xl md:grid-cols-2">
        <div className="flex flex-col justify-center gap-4 border-b border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-8 md:border-r md:border-b-0 md:p-12">
          <span className="inline-flex w-fit rounded border border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-[var(--primary)]">
            Eventify
          </span>
          <h1 className="font-['Hanken_Grotesk'] text-4xl font-semibold leading-none tracking-tight text-[var(--on-surface)] md:text-5xl">
            {email ? 'Verify reset code' : 'Forgot password'}
          </h1>
          <p className="text-[var(--on-surface-variant)]">
            {email
              ? 'Enter the 6-digit code from your email. After it is verified, you can choose a new password.'
              : 'Enter your university email and we will send you a 6-digit reset code.'}
          </p>
          {email ? <p className="text-sm text-[var(--primary)]">Code requested for {email}</p> : null}
        </div>

        {!email ? (
          <form className="grid content-center gap-4 p-8 md:p-12" onSubmit={emailForm.handleSubmit(onRequestCode)}>
            <label className="grid gap-2" htmlFor="email">
              <span className="text-sm text-[var(--on-surface-variant)]">Email</span>
              <Input
                id="email"
                type="email"
                placeholder="1210000@student.birzeit.edu"
                {...emailForm.register('email')}
                autoComplete="email"
                autoFocus
                required
              />
            </label>

            {emailForm.formState.errors.email ? (
              <p className="text-sm text-[var(--error)]">{emailForm.formState.errors.email.message}</p>
            ) : null}
            {requestMutation.error ? <StatusMessage tone="error">{requestMutation.error.message}</StatusMessage> : null}

            <Button type="submit" disabled={requestMutation.isPending}>
              {requestMutation.isPending ? 'Sending code...' : 'Send reset code'}
            </Button>

            <p className="text-center text-[var(--on-surface-variant)]">
              Remembered your password?{' '}
              <Link className="text-[var(--primary)] transition hover:text-[var(--primary-fixed-dim)]" to="/login">
                Go to login
              </Link>
            </p>
          </form>
        ) : (
          <form className="grid content-center gap-4 p-8 md:p-12" onSubmit={codeForm.handleSubmit(onVerifyCode)}>
            {requestMutation.data ? <StatusMessage tone="success">{requestMutation.data.message}</StatusMessage> : null}

            <label className="grid gap-2" htmlFor="code">
              <span className="text-sm text-[var(--on-surface-variant)]">6-digit reset code</span>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                {...codeForm.register('code')}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                required
              />
            </label>

            {codeForm.formState.errors.code ? (
              <p className="text-sm text-[var(--error)]">{codeForm.formState.errors.code.message}</p>
            ) : null}
            {verifyMutation.error ? <StatusMessage tone="error">{verifyMutation.error.message}</StatusMessage> : null}

            <Button type="submit" disabled={verifyMutation.isPending}>
              {verifyMutation.isPending ? 'Verifying...' : 'Verify code'}
            </Button>

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
              <button
                className="text-[var(--primary)] transition hover:text-[var(--primary-fixed-dim)] disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                disabled={requestMutation.isPending || resendSeconds > 0}
                onClick={requestAnotherCode}
              >
                {requestMutation.isPending
                  ? 'Sending...'
                  : resendSeconds > 0
                    ? `Send another code (${resendSeconds}s)`
                    : 'Send another code'}
              </button>
              <button
                className="text-[var(--on-surface-variant)] transition hover:text-[var(--primary)]"
                type="button"
                onClick={useAnotherEmail}
              >
                Use another email
              </button>
              <Link className="text-[var(--on-surface-variant)] transition hover:text-[var(--primary)]" to="/login">
                Login
              </Link>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

export default ForgotPasswordPage
