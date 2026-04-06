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

---

## 🛠️ Development & Migrations

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
