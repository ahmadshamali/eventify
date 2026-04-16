import {Link, useNavigate} from 'react-router-dom'
import {register as registerUser} from './authApi'
import type {RegisterRequest, UserRole} from './auth.types'
import * as z from "zod";
import {type SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation} from "@tanstack/react-query";


type RegisterFormState = {
    full_name: string
    email: string
    password: string
    role: UserRole
    student_number: string
    major: string
    club_name: string
}

const initialFormState: RegisterFormState = {
    full_name: '',
    email: '',
    password: '',
    role: 'student',
    student_number: '',
    major: '',
    club_name: '',
}

const registerFormSchema = z.object({
    full_name: z.string().min(1, {message: 'Full name is required'}),
    email: z.string().email({message: 'Invalid email address'}),
    password: z.string().min(8, {message: 'Password must be at least 8 characters'}),
    role: z.enum(['student', 'organizer']),
    student_number: z.string(),
    major: z.string(),
    club_name: z.string(),
}).refine((data) => {
    if (data.role === 'student') {
        return data.student_number.length >= 6;
    }

    return true;
}, {
    message: "Student number must be at least 6 characters",
    path: ['student_number'],
}).refine((data) => {
    if (data.role === 'student') {
        return data.major.length >= 1;
    }

    return true;
}, {
    message: "Student major is required",
    path: ['major'],
}).refine((data) => {
    if (data.role === 'organizer') {
        return data.club_name.length >= 1;
    }

    return true;
}, {
    message: "Club is required",
    path: ['club_name'],
});

type FormInputs = {
    full_name: string
    email: string
    password: string
    role: UserRole
    student_number: string
    major: string
    club_name: string
}

function RegisterPage() {
    const navigate = useNavigate();

    const {
        watch,
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<FormInputs>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: initialFormState
    });

    const {isPending: isSubmitting, error, mutateAsync: callRegisterUser} = useMutation({
        mutationFn: (payload: RegisterRequest) => {
            return registerUser(payload);
        }
    })

    const onSubmit: SubmitHandler<FormInputs> = (data) => {
        const payload = buildPayload(data);
        return callRegisterUser(payload);
    }

    function buildPayload(data: RegisterFormState): RegisterRequest {
        if (data.role === 'student') {
            return {
                full_name: data.full_name.trim(),
                email: data.email.trim(),
                password: data.password,
                role: 'student',
                student_profile: {
                    student_number: data.student_number.trim(),
                    major: data.major.trim(),
                },
            }
        }

        return {
            full_name: data.full_name.trim(),
            email: data.email.trim(),
            password: data.password,
            role: 'organizer',
            organizer_profile: {
                club_name: data.club_name.trim(),
            },
        }
    }

    const isStudent = watch('role') === 'student'

    return (
        <div className="auth-shell">
            <div className="auth-orb auth-orb-left"/>
            <div className="auth-orb auth-orb-right"/>

            <section className="auth-card">
                <div className="auth-copy">
                    <span className="auth-eyebrow">Eventify</span>
                    <h1>Create your account</h1>
                    <p>
                        Join the platform as a student or organizer. The form adapts to the
                        role required by the backend.
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                    <label className="auth-field">
                        <span>Full name</span>
                        <input
                            placeholder="Ahmad Ali"
                            {...register('full_name')}
                        />
                    </label>

                    {errors.full_name && (
                        <p style={{color: 'red'}}>{errors.full_name.message}</p>
                    )}

                    <label className="auth-field">
                        <span>Email</span>
                        <input
                            placeholder="student@university.edu"
                            {...register('email')}
                        />
                    </label>

                    {errors.email && (
                        <p style={{color: 'red'}}>{errors.email.message}</p>
                    )}

                    <label className="auth-field">
                        <span>Password</span>
                        <input
                            placeholder="At least 8 characters"
                            {...register('password')}
                            type="password"
                        />
                    </label>

                    {errors.password && (
                        <p style={{color: 'red'}}>{errors.password.message}</p>
                    )}

                    <label className="auth-field">
                        <span>Role</span>
                        <select {...register('role')}>
                            <option value="student">Student</option>
                            <option value="organizer">Organizer</option>
                        </select>
                    </label>

                    {errors.role && (
                        <p style={{color: 'red'}}>{errors.role.message}</p>
                    )}

                    {isStudent ? (
                        <>
                            <label className="auth-field">
                                <span>Student number</span>
                                <input
                                    placeholder="202300123"
                                    {...register('student_number')}
                                />
                            </label>

                            {errors.student_number && (
                                <p style={{color: 'red'}}>{errors.student_number.message}</p>
                            )}

                            <label className="auth-field">
                                <span>Major</span>
                                <input
                                    placeholder="Computer Science"
                                    {...register('major')}
                                />
                            </label>

                            {errors.major && (
                                <p style={{color: 'red'}}>{errors.major.message}</p>
                            )}
                        </>
                    ) : (
                        <>
                            <label className="auth-field">
                                <span>Club name</span>
                                <input
                                    placeholder="IEEE Student Branch"
                                    {...register('club_name')}
                                />
                            </label>

                            {errors.club_name && (
                                <p style={{color: 'red'}}>{errors.club_name.message}</p>
                            )}
                        </>
                    )}

                    {error ? <div className="auth-message auth-error">{error.message}</div> : null}

                    <button className="auth-submit" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating account...' : 'Create account'}
                    </button>

                    <p className="auth-footer">
                        Already registered? <Link to="/login">Go to login</Link>
                    </p>
                </form>
            </section>
        </div>
    )
}

export default RegisterPage
