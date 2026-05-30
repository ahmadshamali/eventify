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
    <div className="grid min-h-screen place-items-center bg-[#0b1326] px-4 py-8 text-[#dae2fd]">
      <section className="grid w-full max-w-[900px] grid-cols-1 overflow-hidden rounded-xl border border-[#4f4633] bg-[#131b2e] shadow-2xl md:grid-cols-2">
        <div className="flex flex-col justify-center gap-4 border-b border-[#4f4633] bg-[#060e20] p-8 md:border-r md:border-b-0 md:p-12">
          <span className="inline-flex w-fit rounded border border-[#4f4633] bg-[#222a3d] px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-[#ffe1a7]">
            Eventify
          </span>
          <h1 className="font-['Hanken_Grotesk'] text-4xl font-semibold leading-none tracking-tight text-[#dae2fd] md:text-5xl">Welcome back</h1>
          <p className="text-[#d3c5ac]">Sign in to manage your events and registrations.</p>
        </div>

        <form className="grid gap-4 p-8 md:p-12" onSubmit={handleSubmit(onSubmit)} autoComplete="on">
          <label className="grid gap-2" htmlFor="email">
            <span className="text-sm text-[#d3c5ac]">Email</span>
            <Input
              id="email"
              type="email"
              placeholder="1210000@student.birzeit.edu"
              {...register('email')}
              autoComplete="email"
              required
            />
          </label>

          {errors.email && <p className="text-sm text-[#ffb4ab]">{errors.email.message}</p>}

          <label className="grid gap-2" htmlFor="password">
            <span className="text-sm text-[#d3c5ac]">Password</span>
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

          {errors.password && <p className="text-sm text-[#ffb4ab]">{errors.password.message}</p>}

          {error ? (
            <StatusMessage tone="error">{error.message}</StatusMessage>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>

          <p className="text-center text-[#d3c5ac]">
            Don&apos;t have an account?{' '}
            <Link className="text-[#ffe1a7] transition hover:text-[#f9bd22]" to="/register">
              Go to register
            </Link>
          </p>
        </form>
      </section>
    </div>
  )
}

export default LoginPage
