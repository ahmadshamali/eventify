# Feedback Feature

## Goal
Add anonymous student feedback for completed events.

## Current Related Files

### Frontend
- `frontend/src/features/events/EventsPage.tsx`
- `frontend/src/features/events/MyEventsPage.tsx`
- `frontend/src/features/events/MyRegistrationsPage.tsx`
- `frontend/src/features/events/event.types.ts`
- `frontend/src/features/events/eventApi.ts`
- `frontend/src/features/events/EventDetailsPage.tsx`

### Backend
- `backend/app/features/events/router.py`
- `backend/app/features/events/service.py`
- `backend/app/features/events/schemas.py`
- `backend/app/features/registration/router.py`
- `backend/app/features/registration/service.py`
- `backend/app/features/registration/schemas.py`
- `backend/app/models/event.py`
- `backend/app/models/registration.py`

## Requirements
1. Completed events disappear from public events, but remain visible to the organizer in My Events and to the student in My Registrations.
2. In My Registrations, completed events should show a `Give Feedback` action instead of `Details`.
3. Clicking it should open a form with:
   - a required star rating from 1 to 5
   - an optional text comment with helper text like `How did you find it?`
   - a submit button
4. Feedback must be anonymous for the organizer view.
5. Organizers should see `Feedbacks` instead of `Details` and view all feedback entries for their own events.

## Open Questions
- Should feedback be tied to a registration record, or only to the event and student?
- Should each student be allowed to submit feedback only once per event?
- Should organizers see feedback inside the event details page or a separate feedback page?
- Should feedback be stored in a new database table?

## Notes
- Keep the feature scoped to completed events only.
- Reuse the existing events/registrations structure where possible.
