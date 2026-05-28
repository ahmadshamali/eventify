import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { register as registerUser } from './authApi'
import type { RegisterRequest } from './auth.types'
import * as z from 'zod'
import { type SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import Button from '../../shared/components/Button'
import Input from '../../shared/components/Input'
import PasswordInput from '../../shared/components/PasswordInput'
import StatusMessage from '../../shared/components/StatusMessage'

const allowedEmailDomain = /@(student|staff)\.birzeit\.edu$/i

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
                message: 'Email must end with @student.birzeit.edu or @staff.birzeit.edu',
            }),
        password: z
            .string()
            .min(8, { message: 'Password must be at least 8 characters' })
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
        watch,
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

    const isStudent = watch('role') === 'student'

    return (
        <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-8">
            <div className="pointer-events-none absolute left-[-8%] top-[5%] h-88 w-88 rounded-full bg-blue-600/40 blur-[70px]" />
            <div className="pointer-events-none absolute bottom-0 right-[-10%] h-88 w-88 rounded-full bg-cyan-500/40 blur-[70px]" />

            <section className="z-10 grid w-full max-w-[860px] grid-cols-1 overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/90 shadow-[0_32px_80px_rgba(15,23,42,0.45)] backdrop-blur-[18px] md:grid-cols-2">
                <div className="flex flex-col justify-center gap-4 bg-gradient-to-br from-blue-500/25 to-cyan-700/20 p-8 md:p-12">
                    <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-[0.85rem] uppercase tracking-[0.14em] text-blue-200">
                        Eventify
                    </span>
                    <h1 className="text-4xl leading-none tracking-tight text-white md:text-5xl">Create your account</h1>
                    <p className="text-slate-300">
                        Join the platform as a student or organizer to create and manage events, and connect with your campus community.
                    </p>
                </div>

                <form className="grid gap-4 p-8 md:p-12" onSubmit={handleSubmit(onSubmit)} autoComplete="on">
                    <label className="grid gap-2">
                        <span className="text-[0.95rem] text-slate-300">Full name</span>
                        <Input
                            {...register('full_name')}
                            autoComplete="name"
                        />
                    </label>

                    {errors.full_name && <p className="text-sm text-red-400">{errors.full_name.message}</p>}

                    <label className="grid gap-2">
                        <span className="text-[0.95rem] text-slate-300">Email</span>
                        <Input
                            placeholder="1210000@student.birzeit.edu"
                            {...register('email')}
                            autoComplete="email"
                        />
                    </label>

                    {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}

                    <label className="grid gap-2">
                        <span className="text-[0.95rem] text-slate-300">Password</span>
                        <PasswordInput
                            placeholder="At least 8 characters"
                            {...register('password')}
                            autoComplete="new-password"
                            showPassword={showPassword}
                            onToggle={() => setShowPassword((value) => !value)}
                        />
                    </label>

                    {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}

                    <label className="grid gap-2">
                        <span className="text-[0.95rem] text-slate-300">Role</span>
                        <select
                            className="w-full rounded-[14px] border border-slate-400/25 bg-slate-900/70 px-4 py-4 text-slate-50 outline-none transition duration-200 focus:-translate-y-px focus:border-blue-400/90 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.16)]"
                            {...register('role')}
                        >
                            <option value="student">Student</option>
                            <option value="organizer">Organizer</option>
                        </select>
                    </label>

                    {errors.role && <p className="text-sm text-red-400">{errors.role.message}</p>}

                    {isStudent ? (
                        <>
                            <label className="grid gap-2">
                                <span className="text-[0.95rem] text-slate-300">Major</span>
                                <Input
                                    placeholder="Computer Science"
                                    {...register('major')}
                                    autoComplete="off"
                                />
                            </label>

                            {errors.major && <p className="text-sm text-red-400">{errors.major.message}</p>}
                        </>
                    ) : (
                        <>
                            <label className="grid gap-2">
                                <span className="text-[0.95rem] text-slate-300">Club name</span>
                                <Input
                                    placeholder="IEEE Student Branch"
                                    {...register('club_name')}
                                    autoComplete="organization"
                                />
                            </label>

                            {errors.club_name && <p className="text-sm text-red-400">{errors.club_name.message}</p>}
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

                    <p className="text-center text-slate-400">
                        Already registered?{' '}
                        <Link className="text-blue-300 transition hover:text-blue-200" to="/login">
                            Go to login
                        </Link>
                    </p>
                </form>
            </section>
        </div>
    )
}

export default RegisterPage
