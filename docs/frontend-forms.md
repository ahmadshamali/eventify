# Frontend Forms (RHF + Zod Standard)

## Required Stack
- React Hook Form
- Zod

## Pattern
1. Define Zod schema
2. Infer type using z.infer
3. Use React Hook Form for state
4. Validate using Zod
5. Submit through service

## Rules
- One schema per form
- Do not duplicate types
- Use backend schema as source of truth
- Keep payload mapping explicit

## Numbers
- HTML inputs return strings
- Use z.coerce.number() for numeric fields

## AI Behavior
- Inspect backend schema before writing validation
- Do not guess field types
- Do not rewrite UI unless asked