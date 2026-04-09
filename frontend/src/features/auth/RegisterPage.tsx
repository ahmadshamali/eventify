import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from './authApi'
import type { RegisterRequest, UserRole } from './auth.types'

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

function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<RegisterFormState>(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await register(buildPayload(formData))
      setSuccess('Account created successfully. You can sign in after approval.')
      setFormData(initialFormState)
      window.setTimeout(() => navigate('/events'), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isStudent = formData.role === 'student'

  return (
    <div className="auth-shell">
      <div className="auth-orb auth-orb-left" />
      <div className="auth-orb auth-orb-right" />

      <section className="auth-card">
        <div className="auth-copy">
          <span className="auth-eyebrow">Eventify</span>
          <h1>Create your account</h1>
          <p>
            Join the platform as a student or organizer. The form adapts to the
            role required by the backend.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Full name</span>
            <input
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Ahmad Ali"
              required
            />
          </label>

          <label className="auth-field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@university.edu"
              required
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </label>

          <label className="auth-field">
            <span>Role</span>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="organizer">Organizer</option>
            </select>
          </label>

          {isStudent ? (
            <>
              <label className="auth-field">
                <span>Student number</span>
                <input
                  name="student_number"
                  type="text"
                  value={formData.student_number}
                  onChange={handleChange}
                  placeholder="202300123"
                  required={isStudent}
                />
              </label>

              <label className="auth-field">
                <span>Major</span>
                <input
                  name="major"
                  type="text"
                  value={formData.major}
                  onChange={handleChange}
                  placeholder="Computer Science"
                  required={isStudent}
                />
              </label>
            </>
          ) : (
            <label className="auth-field">
              <span>Club name</span>
              <input
                name="club_name"
                type="text"
                value={formData.club_name}
                onChange={handleChange}
                placeholder="IEEE Student Branch"
                required={!isStudent}
              />
            </label>
          )}

          {error ? <div className="auth-message auth-error">{error}</div> : null}
          {success ? <div className="auth-message auth-success">{success}</div> : null}

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
