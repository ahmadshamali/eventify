import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import * as z from 'zod'
import { login } from './authApi'
import type { LoginRequest } from './auth.types'

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
    onSuccess: () => {
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
    <div className="auth-shell">
      <div className="auth-orb auth-orb-left" />
      <div className="auth-orb auth-orb-right" />

      <section className="auth-card">
        <div className="auth-copy">
          <span className="auth-eyebrow">Eventify</span>
          <h1>Welcome back</h1>
          <p>Sign in to manage your events and registrations.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <label className="auth-field" htmlFor="email">
            <span>Email</span>
            <input
              id="email"
              type="email"
              placeholder="student@birzeit.edu"
              {...register('email')}
              required
            />
          </label>

          {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}

          <label className="auth-field" htmlFor="password">
            <span>Password</span>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
              required
            />
          </label>

          {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}

          {error ? <div className="auth-message auth-error">{error.message}</div> : null}

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="auth-footer">
            Don&apos;t have an account? <Link to="/register">Go to register</Link>
          </p>
        </form>
      </section>
    </div>
  )
}

export default LoginPage
