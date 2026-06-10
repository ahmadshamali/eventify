# Eventify

Eventify is a modern, full-stack application for discovering and managing upcoming events. It utilizes a React frontend with a sleek glassmorphism UI, and a containerized FastAPI backend supported by a MySQL database.

## Architecture

- **Frontend**: React, TypeScript, Vite, TanStack React Query, Custom CSS.
- **Backend**: Python, FastAPI, SQLAlchemy (ORM), Alembic (Migrations), PyMySQL.
- **Database**: MySQL 8.0
- **Infrastructure**: Docker & Docker Compose for the backend services.

## Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Node.js](https://nodejs.org/) (v18+ recommended) and `npm`

---

## 🚀 Getting Started

### 1. Start the Backend

The backend runs entirely within Docker to keep your local machine clean.

```bash
# Start the API and Database in the background
docker compose up -d --build
```

The backend API will be available at: `http://localhost:8000`  
The Interactive Swagger API Documentation (for seed testing) is at: `http://localhost:8000/docs`

### 2. Run Database Migrations (Alembic)

To ensure your database tables are up to date, run the Alembic migrations schema upgrade:

```bash

docker compose exec api alembic upgrade head
```

### 3. Start the Frontend

Navigate to the `frontend/` directory and spin up the Vite development server.

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Connect with DBeaver

When using the development Docker Compose setup, connect DBeaver to the
published host port:

- Host: `localhost`
- Port: `3307`
- Database: `eventify`
- Username: `eventify`
- Password: `eventify_password`

MySQL uses port `3306` inside Docker, so the API connects to `db:3306`.
DBeaver runs on the host and must connect to `localhost:3307`.

---

## � Email Setup (Development)

The project uses **Mailtrap** for email testing in development. When users register or organizers are approved/rejected, emails are sent to Mailtrap instead of real inboxes.

### Setup Steps

1. **Sign up for Mailtrap** (free account):
   - Go to [mailtrap.io](https://mailtrap.io)
   - Create an account and sign in
   - Create a new **Inbox** (or use the default "Demo Inbox")

2. **Get your SMTP credentials**:
   - Open your Inbox
   - Click **Integrations** → **SMTP Settings**
   - You'll see:
     - Host
     - Port
     - Username
     - Password

3. **Create `.env.local` in the project root**:
   ```bash
   # At: c:/Users/<your-username>/eventify-1/.env.local
   SMTP_HOST=sandbox.smtp.mailtrap.io
   SMTP_PORT=587
   SMTP_USER=YOUR_MAILTRAP_USERNAME
   SMTP_PASSWORD=YOUR_MAILTRAP_PASSWORD
   SMTP_FROM_EMAIL=noreply@eventify.local
   SMTP_FROM_NAME=Eventify
   FRONTEND_URL=http://localhost:5173
   SMTP_ENABLED=true

   # JWT Configuration (Required for login flow)
   JWT_SECRET_KEY=CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS
   JWT_ALGORITHM=HS256
   JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

   # Gemini AI configuration
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
   GEMINI_MODEL=gemini-2.5-flash
   ```
   
   **Important**: 
   - Create this file locally only (it's in `.gitignore`)
   - Each developer needs their own `.env.local`
   - `JWT_SECRET_KEY` should be a long random string in production
   - `GEMINI_API_KEY` must be set for the AI description generator to work
   - If you keep using Docker, the API container reads these values from `.env.local` via `docker compose`


4. **Restart Docker to load the new env file**:
   ```bash
   docker compose down
   docker compose up -d
   ```

5. **Apply database migrations**:
   ```bash
   docker compose exec api alembic upgrade head
   ```

6. **Test email sending**:
   - Go to `http://localhost:5173/register`
   - Create a new account
   - The verification email will appear in your **Mailtrap inbox** (not your real email)
   - Click the verification link in the email or copy the token to verify your account

### Important Notes

- **Never commit `.env.local`** — it's in `.gitignore` and should only exist locally
- Each developer should create their own `.env.local` with their own Mailtrap credentials
- Emails sent during development appear in **Mailtrap only**, not in real mailboxes
- If `SMTP_ENABLED=false`, the registration endpoint will log the token but not send emails

### After Pull (Teammates)

**When you pull fresh code, run these commands:**

```bash
# 1. Create local environment file (if it doesn't exist)
# Copy the JWT and SMTP variables from the template above into .env.local

# 2. Rebuild the API image and start containers
docker compose build api
docker compose up -d db api

# 3. Apply latest database migrations
docker compose exec api alembic upgrade head

# 4. Install frontend dependencies and start dev server
cd frontend
npm install
npm run dev
```

**What changed that requires these steps:**

- **JWT Implementation**: Login now returns a JWT token. Frontend stores it in `localStorage` and auto-attaches it to all API requests.
- **Email Verification**: After registration, users must verify their email before logging in.
- **Database Schema**: New migrations added for email verification and JWT support. `alembic upgrade head` applies these.
- **Dependencies**: Backend has new packages (PyJWT, updated bcrypt compatibility). `docker compose build api` installs them.

**After these steps, the app is ready to use:**
- Register at `http://localhost:5173/register` with an email ending in `@student.birzeit.edu` or `@staff.birzeit.edu`
- Verify email via the link in Mailtrap
- Login returns a JWT token automatically
- All protected endpoints receive the JWT in the Authorization header

---

## �🛠️ Development & Migrations

If you make any changes to the models in `backend/models.py` (like adding a new table column), you need to record and apply the change using Alembic.

1. **Autogenerate a migration script:**
   ```bash
   docker compose exec api alembic revision --autogenerate -m "Describe your change"
   ```
   
2. **Apply the migration to the database:**
   ```bash
   docker compose exec api alembic upgrade head
   ```

Because your `./backend` directory is mounted dynamically into the Docker container via `volumes`, any edits you save to your Python logic are hot-reloaded instantly without needing to rebuild the Docker image!
