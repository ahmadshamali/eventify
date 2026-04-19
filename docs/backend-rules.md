# Backend Rules

## Architecture
- Router handles HTTP only
- Service handles logic
- Schema handles validation
- Model handles DB structure

## Validation
- Use Pydantic schemas for request and response
- Do not rely on frontend validation only
- Always validate input in backend

## Database
- Use SQLAlchemy models
- Keep schema aligned with DB structure
- Use migrations for changes

## Error Handling
- Handle DB errors (IntegrityError, etc.)
- Return proper HTTP status codes

## AI Behavior
- Do not move logic into router
- Do not break service layer
- Do not invent fields not in schema