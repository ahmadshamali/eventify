import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import * as z from 'zod'

import { forgotPassword, resetPassword } from './authApi'
import type { ForgotPasswordRequest, ResetPasswordRequest } from './auth.types'
import Button from '../../shared/components/Button'
import Input from '../../shared/components/Input'
import PasswordInput from '../../shared/components/PasswordInput'
import StatusMessage from '../../shared/components/StatusMessage'

const allowedEmailDomain = /@(student|staff)\.birzeit\.edu$/i

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Invalid email address' })
    .refine((value) => allowedEmailDomain.test(value), {
      message: 'Email must end with @student.birzeit.edu or @staff.birzeit.edu',
    }),
})

const resetSchema = z
  .object({
    code: z.string().trim().regex(/^\d{6}$/, { message: 'Reset code must be a 6-digit number' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }).max(255),
    confirmPassword: z.string().min(1, { message: 'Please confirm your new password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type EmailFormState = z.infer<typeof emailSchema>
type ResetFormState = z.infer<typeof resetSchema>

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const emailForm = useForm<EmailFormState>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  })

  const resetForm = useForm<ResetFormState>({
    resolver: zodResolver(resetSchema),
    defaultValues: { code: '', password: '', confirmPassword: '' },
  })

  const requestMutation = useMutation({
    mutationFn: (payload: ForgotPasswordRequest) => forgotPassword(payload),
    onSuccess: (_, payload) => setEmail(payload.email),
  })

  const resetMutation = useMutation({
    mutationFn: (payload: ResetPasswordRequest) => resetPassword(payload),
  })

  useEffect(() => {
    if (!resetMutation.isSuccess) return undefined

    const timer = window.setTimeout(() => navigate('/login', { replace: true }), 1800)
    return () => window.clearTimeout(timer)
  }, [navigate, resetMutation.isSuccess])

  const onRequestCode: SubmitHandler<EmailFormState> = (data) => {
    return requestMutation.mutateAsync({ email: data.email.trim().toLowerCase() })
  }

  const onResetPassword: SubmitHandler<ResetFormState> = (data) => {
    return resetMutation.mutateAsync({
      email,
      code: data.code.trim(),
      new_password: data.password,
    })
  }

  const requestAnotherCode = () => {
    resetMutation.reset()
    resetForm.resetField('code')
    requestMutation.mutate({ email })
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--background)] px-4 py-8 text-[var(--on-surface)]">
      <section className="grid w-full max-w-[900px] grid-cols-1 overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] shadow-2xl md:grid-cols-2">
        <div className="flex flex-col justify-center gap-4 border-b border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-8 md:border-r md:border-b-0 md:p-12">
          <span className="inline-flex w-fit rounded border border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-[var(--primary)]">
            Eventify
          </span>
          <h1 className="font-['Hanken_Grotesk'] text-4xl font-semibold leading-none tracking-tight text-[var(--on-surface)] md:text-5xl">
            Reset password
          </h1>
          <p className="text-[var(--on-surface-variant)]">
            {email
              ? 'Enter the 6-digit code from your email and choose a new password.'
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
          <form className="grid gap-4 p-8 md:p-12" onSubmit={resetForm.handleSubmit(onResetPassword)}>
            {requestMutation.data ? <StatusMessage tone="success">{requestMutation.data.message}</StatusMessage> : null}

            <label className="grid gap-2" htmlFor="code">
              <span className="text-sm text-[var(--on-surface-variant)]">6-digit reset code</span>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                {...resetForm.register('code')}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                required
              />
            </label>
            {resetForm.formState.errors.code ? (
              <p className="text-sm text-[var(--error)]">{resetForm.formState.errors.code.message}</p>
            ) : null}

            <label className="grid gap-2" htmlFor="new-password">
              <span className="text-sm text-[var(--on-surface-variant)]">New password</span>
              <PasswordInput
                id="new-password"
                placeholder="At least 8 characters"
                {...resetForm.register('password')}
                autoComplete="new-password"
                showPassword={showPassword}
                onToggle={() => setShowPassword((value) => !value)}
                required
              />
            </label>
            {resetForm.formState.errors.password ? (
              <p className="text-sm text-[var(--error)]">{resetForm.formState.errors.password.message}</p>
            ) : null}

            <label className="grid gap-2" htmlFor="confirm-password">
              <span className="text-sm text-[var(--on-surface-variant)]">Confirm new password</span>
              <PasswordInput
                id="confirm-password"
                placeholder="Repeat your new password"
                {...resetForm.register('confirmPassword')}
                autoComplete="new-password"
                showPassword={showPassword}
                onToggle={() => setShowPassword((value) => !value)}
                required
              />
            </label>
            {resetForm.formState.errors.confirmPassword ? (
              <p className="text-sm text-[var(--error)]">{resetForm.formState.errors.confirmPassword.message}</p>
            ) : null}

            {resetMutation.isSuccess ? (
              <StatusMessage tone="success">{resetMutation.data.message} Redirecting to login...</StatusMessage>
            ) : null}
            {resetMutation.error ? <StatusMessage tone="error">{resetMutation.error.message}</StatusMessage> : null}

            <Button type="submit" disabled={resetMutation.isPending || resetMutation.isSuccess}>
              {resetMutation.isPending ? 'Changing password...' : resetMutation.isSuccess ? 'Password changed' : 'Change password'}
            </Button>

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
              <button
                className="text-[var(--primary)] transition hover:text-[var(--primary-fixed-dim)] disabled:opacity-60"
                type="button"
                disabled={requestMutation.isPending}
                onClick={requestAnotherCode}
              >
                {requestMutation.isPending ? 'Sending...' : 'Send another code'}
              </button>
              <button
                className="text-[var(--on-surface-variant)] transition hover:text-[var(--primary)]"
                type="button"
                onClick={() => {
                  setEmail('')
                  requestMutation.reset()
                  resetMutation.reset()
                  resetForm.reset()
                }}
              >
                Use another email
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

export default ForgotPasswordPage
