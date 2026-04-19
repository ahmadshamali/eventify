# Frontend Rules

## Forms
- Use React Hook Form for form state
- Use Zod for validation
- Use z.infer<typeof schema> for types
- Do not duplicate types manually

## Validation
- Match backend schema exactly
- Use z.coerce.number() for numeric inputs
- Do not invent fields

## Structure
- Keep UI unchanged unless explicitly asked
- Do not rewrite entire components
- Reuse existing components and services

## API Calls
- All API calls go through service files
- Do not call fetch/axios directly inside components (unless already done)

## AI Behavior
- Inspect component + service + backend schema before editing
- Make minimal safe edits only