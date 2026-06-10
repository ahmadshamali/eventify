import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import * as z from 'zod'

import { resetPassword } from './authApi'
import type { ResetPasswordRequest } from './auth.types'
import Button from '../../shared/components/Button'
import PasswordInput from '../../shared/components/PasswordInput'
import StatusMessage from '../../shared/components/StatusMessage'

const resetSchema = z
  .object({
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }).max(255),
    confirmPassword: z.string().min(1, { message: 'Please confirm your new password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetFormState = z.infer<typeof resetSchema>
type ResetPasswordLocationState = { email: string; code: string }

function ResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const resetDetails = location.state as ResetPasswordLocationState | null

  const resetForm = useForm<ResetFormState>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const resetMutation = useMutation({
    mutationFn: (payload: ResetPasswordRequest) => resetPassword(payload),
  })

  useEffect(() => {
    if (!resetMutation.isSuccess) return undefined

    const timer = window.setTimeout(() => navigate('/login', { replace: true }), 1800)
    return () => window.clearTimeout(timer)
  }, [navigate, resetMutation.isSuccess])

  if (!resetDetails?.email || !resetDetails.code) {
    return <Navigate to="/forgot-password" replace />
  }

  const onResetPassword: SubmitHandler<ResetFormState> = (data) => {
    return resetMutation.mutateAsync({
      email: resetDetails.email,
      code: resetDetails.code,
      new_password: data.password,
    })
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--background)] px-4 py-8 text-[var(--on-surface)]">
      <section className="grid w-full max-w-[900px] grid-cols-1 overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] shadow-2xl md:grid-cols-2">
        <div className="flex flex-col justify-center gap-4 border-b border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-8 md:border-r md:border-b-0 md:p-12">
          <span className="inline-flex w-fit rounded border border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-[var(--primary)]">
            Eventify
          </span>
          <h1 className="font-['Hanken_Grotesk'] text-4xl font-semibold leading-none tracking-tight text-[var(--on-surface)] md:text-5xl">
            Choose a new password
          </h1>
          <p className="text-[var(--on-surface-variant)]">
            Your reset code was verified. Enter your new password twice to finish.
          </p>
        </div>

        <form className="grid content-center gap-4 p-8 md:p-12" onSubmit={resetForm.handleSubmit(onResetPassword)}>
          <label className="grid gap-2" htmlFor="new-password">
            <span className="text-sm text-[var(--on-surface-variant)]">New password</span>
            <PasswordInput
              id="new-password"
              placeholder="At least 8 characters"
              {...resetForm.register('password')}
              autoComplete="new-password"
              showPassword={showPassword}
              onToggle={() => setShowPassword((value) => !value)}
              autoFocus
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

          <Link className="text-center text-sm text-[var(--on-surface-variant)] transition hover:text-[var(--primary)]" to="/login">
            Login
          </Link>
        </form>
      </section>
    </div>
  )
}

export default ResetPasswordPage
