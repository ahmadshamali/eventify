import { Link } from 'react-router-dom'

function LoginPage() {
  return (
    <div className="auth-shell">
      <div className="auth-orb auth-orb-left" />
      <div className="auth-orb auth-orb-right" />

      <section className="auth-card">
        <div className="auth-copy">
          <span className="auth-eyebrow">Eventify</span>
          <h1>Login page placeholder</h1>
          <p>
            Signup is wired and ready. This page can be connected to the login
            endpoint next.
          </p>
        </div>

        <div className="auth-form">
          <Link className="auth-submit auth-link-button" to="/register">
            Back to register
          </Link>
        </div>
      </section>
    </div>
  )
}

export default LoginPage
