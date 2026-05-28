import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as z from 'zod'
import { login } from './authApi'
import type { LoginRequest } from './auth.types'
import { useAuth } from '../../context/AuthContext'
import Button from '../../shared/components/Button'
import Input from '../../shared/components/Input'
import PasswordInput from '../../shared/components/PasswordInput'
import StatusMessage from '../../shared/components/StatusMessage'

const allowedEmailDomain = /@(student|staff)\.birzeit\.edu$/i

const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Invalid email address' })
    .refine((value) => allowedEmailDomain.test(value), {
      message: 'Email must end with @student.birzeit.edu or @staff.birzeit.edu',
    }),
  password: z.string().min(1, { message: 'Password is required' }).max(255),
})

type LoginFormState = z.infer<typeof loginFormSchema>

const initialFormState: LoginFormState = {
  email: '',
  password: '',
}

function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormState>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: initialFormState,
  })

  const { isPending: isSubmitting, error, mutateAsync: callLogin } = useMutation({
    mutationFn: (payload: LoginRequest) => {
      return login(payload)
    },
    onSuccess: (response) => {
      signIn(response.access_token, response.user.full_name)
      navigate('/events')
    },
  })

  const onSubmit: SubmitHandler<LoginFormState> = (data) => {
    const payload: LoginRequest = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
    }

    return callLogin(payload)
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
          <h1 className="text-4xl leading-none tracking-tight text-white md:text-5xl">Welcome back</h1>
          <p className="text-slate-300">Sign in to manage your events and registrations.</p>
        </div>

        <form className="grid gap-4 p-8 md:p-12" onSubmit={handleSubmit(onSubmit)} autoComplete="on">
          <label className="grid gap-2" htmlFor="email">
            <span className="text-[0.95rem] text-slate-300">Email</span>
            <Input
              id="email"
              type="email"
              placeholder="1210000@student.birzeit.edu"
              {...register('email')}
              autoComplete="email"
              required
            />
          </label>

          {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}

          <label className="grid gap-2" htmlFor="password">
            <span className="text-[0.95rem] text-slate-300">Password</span>
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              {...register('password')}
              autoComplete="current-password"
              showPassword={showPassword}
              onToggle={() => setShowPassword((value) => !value)}
              required
            />
          </label>

          {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}

          {error ? (
            <StatusMessage tone="error">{error.message}</StatusMessage>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>

          <p className="text-center text-slate-400">
            Don&apos;t have an account?{' '}
            <Link className="text-blue-300 transition hover:text-blue-200" to="/register">
              Go to register
            </Link>
          </p>
        </form>
      </section>
    </div>
  )
}

export default LoginPage
