# Project Context - Eventify

## Stack
- Frontend: React + TypeScript + Vite
- Backend: FastAPI + SQLAlchemy + Alembic + MySQL
- No Django or DRF anywhere

## Architecture
- Backend follows layered structure:
  - router = HTTP layer
  - service = business logic
  - schema = request/response contract
  - model = database

- Frontend:
  - pages handle layout
  - services handle API calls
  - forms use React Hook Form + Zod

## Rules
- Minimal safe edits only
- Do not refactor unrelated code
- Follow existing folder structure
- Do not rename files unless necessary
- Reuse existing patterns before adding new ones

## Source of Truth
- Backend schemas define API contract
- Database models define structure
- Frontend must match backend, not the opposite