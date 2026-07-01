import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as z from 'zod'

import { verifyEmail } from './authApi'
import type { VerifyEmailRequest } from './auth.types'
import Button from '../../shared/components/Button'
import Input from '../../shared/components/Input'
import StatusMessage from '../../shared/components/StatusMessage'

const verifyEmailSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, { message: 'Verification code must be a 6-digit number' }),
})

type VerifyEmailFormState = z.infer<typeof verifyEmailSchema>

function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const codeFromUrl = searchParams.get('code') ?? searchParams.get('token') ?? ''
  const emailFromUrl = searchParams.get('email') ?? ''

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VerifyEmailFormState>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { code: codeFromUrl },
  })

  useEffect(() => {
    if (codeFromUrl) {
      setValue('code', codeFromUrl)
    }
  }, [codeFromUrl, setValue])

  const {
    mutateAsync: callVerifyEmail,
    isPending: isSubmitting,
    isSuccess,
    data: verifiedUser,
    error,
  } = useMutation({
    mutationFn: (payload: VerifyEmailRequest) => verifyEmail(payload),
  })

  useEffect(() => {
    if (codeFromUrl && !isSuccess && !isSubmitting) {
      void callVerifyEmail({ code: codeFromUrl.trim() })
    }
  }, [callVerifyEmail, codeFromUrl, isSubmitting, isSuccess])

  useEffect(() => {
    if (isSuccess) {
      const timer = window.setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1500)

      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [isSuccess, navigate])

  const onSubmit: SubmitHandler<VerifyEmailFormState> = (formData) => {
    return callVerifyEmail({ code: formData.code.trim() })
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--background)] px-4 py-8 text-[var(--on-surface)]">
      <section className="grid w-full max-w-[900px] grid-cols-1 overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] shadow-2xl md:grid-cols-2">
        <div className="flex flex-col justify-center gap-4 border-b border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-8 md:border-r md:border-b-0 md:p-12">
          <span className="inline-flex w-fit rounded border border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-[var(--primary)]">
            Eventify
          </span>
          <h1 className="font-['Hanken_Grotesk'] text-4xl font-semibold leading-none tracking-tight text-[var(--on-surface)] md:text-5xl">Verify your email</h1>
          <p className="text-[var(--on-surface-variant)]">
            Confirm your account to continue.
          </p>
          <p className="text-[var(--on-surface-variant)]">
          Organizers will still need admin approval after verification.
          </p>
          {emailFromUrl ? <p className="text-sm text-[var(--primary)]">Verification was sent to {emailFromUrl} Check Spam folder</p> : null}
        </div>

        <form className="grid gap-4 p-8 md:p-12" onSubmit={handleSubmit(onSubmit)}>
          <label className="grid gap-2" htmlFor="code">
            <span className="text-sm text-[var(--on-surface-variant)]">Verification code</span>
            <Input
              id="code"
              type="text"
              placeholder="Enter 6-digit code"
              {...register('code')}
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </label>

          {errors.code && <p className="text-sm text-[var(--error)]">{errors.code.message}</p>}

          {isSuccess ? (
            <StatusMessage tone="success">
              Email verified for {verifiedUser.email}.{' '}
              {verifiedUser.account_status === 'active'
                ? 'Your account is active. Redirecting you to login...'
                : 'Your account is waiting for admin approval. Redirecting you to login...'}
            </StatusMessage>
          ) : null}

          {error ? (
            <StatusMessage tone="error">{error.message}</StatusMessage>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting || isSuccess}
          >
            {isSubmitting ? 'Verifying...' : isSuccess ? 'Verified' : 'Verify email'}
          </Button>

          {/* <p className="text-center text-[var(--on-surface-variant)]">
            Already verified?{' '}
            <Link className="text-[var(--primary)] transition hover:text-[var(--primary-fixed-dim)]" to="/login">
              Go to login
            </Link>
          </p> */}
        </form>
      </section>
    </div>
  )
}

export default VerifyEmailPage
