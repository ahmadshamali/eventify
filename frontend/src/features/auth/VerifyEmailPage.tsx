import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import * as z from 'zod'

import { verifyEmail } from './authApi'
import type { VerifyEmailRequest } from './auth.types'

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
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute left-[-8%] top-[5%] h-88 w-88 rounded-full bg-blue-600/40 blur-[70px]" />
      <div className="pointer-events-none absolute bottom-0 right-[-10%] h-88 w-88 rounded-full bg-cyan-500/40 blur-[70px]" />

      <section className="z-10 grid w-full max-w-[860px] grid-cols-1 overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/90 shadow-[0_32px_80px_rgba(15,23,42,0.45)] backdrop-blur-[18px] md:grid-cols-2">
        <div className="flex flex-col justify-center gap-4 bg-gradient-to-br from-blue-500/25 to-cyan-700/20 p-8 md:p-12">
          <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-[0.85rem] uppercase tracking-[0.14em] text-blue-200">
            Eventify
          </span>
          <h1 className="text-4xl leading-none tracking-tight text-white md:text-5xl">Verify your email</h1>
          <p className="text-slate-300">
            Confirm your account to continue. Organizers will still need admin approval after verification.
          </p>
          {emailFromUrl ? <p className="text-sm text-blue-200">Verification was sent to {emailFromUrl}</p> : null}
        </div>

        <form className="grid gap-4 p-8 md:p-12" onSubmit={handleSubmit(onSubmit)}>
          <label className="grid gap-2" htmlFor="code">
            <span className="text-[0.95rem] text-slate-300">Verification code</span>
            <input
              id="code"
              type="text"
              placeholder="Enter 6-digit code"
              {...register('code')}
              inputMode="numeric"
              autoComplete="one-time-code"
              className="w-full rounded-[14px] border border-slate-400/25 bg-slate-900/70 px-4 py-4 text-slate-50 outline-none transition duration-200 focus:-translate-y-px focus:border-blue-400/90 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.16)]"
            />
          </label>

          {errors.code && <p className="text-sm text-red-400">{errors.code.message}</p>}

          {isSuccess ? (
            <div className="rounded-[14px] border border-emerald-400/35 bg-emerald-900/45 px-4 py-3 text-[0.95rem] text-emerald-200">
              Email verified for {verifiedUser.email}.{' '}
              {verifiedUser.account_status === 'active'
                ? 'Your account is active. Redirecting you to login...'
                : 'Your account is waiting for admin approval. Redirecting you to login...'}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[14px] border border-red-400/35 bg-red-900/45 px-4 py-3 text-[0.95rem] text-red-200">
              {error.message}
            </div>
          ) : null}

          <button
            className="cursor-pointer rounded-[14px] bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-4 font-semibold text-white transition duration-200 hover:-translate-y-px hover:shadow-[0_18px_30px_rgba(14,165,233,0.2)] disabled:cursor-wait disabled:opacity-70"
            type="submit"
            disabled={isSubmitting || isSuccess}
          >
            {isSubmitting ? 'Verifying...' : isSuccess ? 'Verified' : 'Verify email'}
          </button>

          <p className="text-center text-slate-400">
            Already verified?{' '}
            <Link className="text-blue-300 transition hover:text-blue-200" to="/login">
              Go to login
            </Link>
          </p>
        </form>
      </section>
    </div>
  )
}

export default VerifyEmailPage
