import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { register as registerUser } from './authApi'
import type { RegisterRequest } from './auth.types'
import * as z from 'zod'
import { type SubmitHandler, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import Button from '../../shared/components/Button'
import Input from '../../shared/components/Input'
import PasswordInput from '../../shared/components/PasswordInput'
import StatusMessage from '../../shared/components/StatusMessage'

const allowedEmailDomain = /^(?:\d{4}|\d{7})@(student|staff)\.birzeit\.edu$/i

const registerFormSchema = z
    .object({
        full_name: z
            .string()
            .trim()
            .min(1, { message: 'Full name is required' })
            .max(255, { message: 'Full name must be at most 255 characters' }),
        email: z
            .string()
            .trim()
            .email({ message: 'Invalid email address' })
            .refine((value) => allowedEmailDomain.test(value), {
                message: 'Email must start with exactly 4 or 7 numbers and use a Birzeit university domain',
            }),
        password: z
            .string()
            .min(8, { message: 'Password must be at least 8 characters' })
            .regex(/[A-Z]/, { message: 'Password must contain an uppercase letter' })
            .regex(/[a-z]/, { message: 'Password must contain a lowercase letter' })
            .regex(/\d/, { message: 'Password must contain a number' })
            .max(255, { message: 'Password must be at most 255 characters' }),
        role: z.enum(['student', 'organizer']),
        major: z.string().trim(),
        club_name: z.string().trim(),
}).superRefine((data, ctx) => {
    if (data.role === 'student') {
        if (data.major.length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['major'], message: 'Student major is required' })
        } else if (data.major.length > 255) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['major'], message: 'Major must be at most 255 characters' })
        }
    }

    if (data.role === 'organizer') {
        if (data.club_name.length === 0) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['club_name'], message: 'Club is required' })
        } else if (data.club_name.length > 255) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['club_name'], message: 'Club name must be at most 255 characters' })
        }
    }
  })

type RegisterFormState = z.infer<typeof registerFormSchema>

const initialFormState: RegisterFormState = {
    full_name: '',
    email: '',
    password: '',
    role: 'student',
    major: '',
    club_name: '',
}

function RegisterPage() {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormState>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: initialFormState,
    })

    const { isPending: isSubmitting, error, mutateAsync: callRegisterUser } = useMutation({
        mutationFn: (payload: RegisterRequest) => {
            return registerUser(payload)
        },
        onSuccess: (user) => {
            navigate(`/verify-email?email=${encodeURIComponent(user.email)}`)
        },
    })

    const onSubmit: SubmitHandler<RegisterFormState> = (data) => {
        const payload = buildPayload(data)
        return callRegisterUser(payload)
    }

    function buildPayload(data: RegisterFormState): RegisterRequest {
        if (data.role === 'student') {
            return {
                full_name: data.full_name.trim(),
                email: data.email.trim().toLowerCase(),
                password: data.password,
                role: 'student',
                student_profile: {
                    major: data.major.trim(),
                },
            }
    }

        return {
            full_name: data.full_name.trim(),
            email: data.email.trim().toLowerCase(),
            password: data.password,
            role: 'organizer',
            organizer_profile: {
                club_name: data.club_name.trim(),
            },
        }
    }

    const isStudent = useWatch({ control, name: 'role' }) === 'student'

    return (
        <div className="grid min-h-screen place-items-center bg-[var(--background)] px-4 py-8 text-[var(--on-surface)]">
            <section className="grid w-full max-w-[920px] grid-cols-1 overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] shadow-2xl md:grid-cols-2">
                <div className="flex flex-col justify-center gap-4 border-b border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-8 md:border-r md:border-b-0 md:p-12">
                    <span className="inline-flex w-fit rounded border border-[var(--outline-variant)] bg-[var(--surface-container-high)] px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-[var(--primary)]">
                        Eventify
                    </span>
                    <h1 className="font-['Hanken_Grotesk'] text-4xl font-semibold leading-none tracking-tight text-[var(--on-surface)] md:text-5xl">Create your account</h1>
                    <p className="text-[var(--on-surface-variant)]">
                        Join the platform as a student or organizer to create and manage events, and connect with your campus community.
                    </p>
                </div>

                <form className="grid gap-4 p-8 md:p-12" onSubmit={handleSubmit(onSubmit)} autoComplete="on">
                    <label className="grid gap-2">
                        <span className="text-sm text-[var(--on-surface-variant)]">Full name</span>
                        <Input
                            {...register('full_name')}
                            autoComplete="name"
                        />
                    </label>

                    {errors.full_name && <p className="text-sm text-[var(--error)]">{errors.full_name.message}</p>}

                    <label className="grid gap-2">
                        <span className="text-sm text-[var(--on-surface-variant)]">Email</span>
                        <Input
                            placeholder="1210000@student.birzeit.edu"
                            {...register('email')}
                            autoComplete="email"
                        />
                    </label>

                    {errors.email && <p className="text-sm text-[var(--error)]">{errors.email.message}</p>}

                    <label className="grid gap-2">
                        <span className="text-sm text-[var(--on-surface-variant)]">Password</span>
                        <PasswordInput
                            placeholder="8+ characters, uppercase, lowercase, number"
                            {...register('password')}
                            autoComplete="new-password"
                            showPassword={showPassword}
                            onToggle={() => setShowPassword((value) => !value)}
                        />
                    </label>

                    {errors.password && <p className="text-sm text-[var(--error)]">{errors.password.message}</p>}

                    <label className="grid gap-2">
                        <span className="text-sm text-[var(--on-surface-variant)]">Role</span>
                        <select
                            className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3 text-[var(--on-surface)] outline-none transition duration-200 focus:border-[var(--primary-fixed-dim)] focus:ring-2 focus:ring-[var(--primary-fixed-dim)]/20"
                            {...register('role')}
                        >
                            <option value="student">Student</option>
                            <option value="organizer">Organizer</option>
                        </select>
                    </label>

                    {errors.role && <p className="text-sm text-[var(--error)]">{errors.role.message}</p>}

                    {isStudent ? (
                        <>
                            <label className="grid gap-2">
                                <span className="text-sm text-[var(--on-surface-variant)]">Major</span>
                                <Input
                                    placeholder="Computer Science"
                                    {...register('major')}
                                    autoComplete="off"
                                />
                            </label>

                            {errors.major && <p className="text-sm text-[var(--error)]">{errors.major.message}</p>}
                        </>
                    ) : (
                        <>
                            <label className="grid gap-2">
                                <span className="text-sm text-[var(--on-surface-variant)]">Club name</span>
                                <Input
                                    placeholder="IEEE Student Branch"
                                    {...register('club_name')}
                                    autoComplete="organization"
                                />
                            </label>

                            {errors.club_name && <p className="text-sm text-[var(--error)]">{errors.club_name.message}</p>}
                        </>
                    )}

                    {error ? (
                        <StatusMessage tone="error">{error.message}</StatusMessage>
                    ) : null}

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating account...' : 'Create account'}
                    </Button>

                    <p className="text-center text-[var(--on-surface-variant)]">
                        Already registered?{' '}
                        <Link className="text-[var(--primary)] transition hover:text-[var(--primary-fixed-dim)]" to="/login">
                            Go to login
                        </Link>
                    </p>
                </form>
            </section>
        </div>
    )
}

export default RegisterPage
