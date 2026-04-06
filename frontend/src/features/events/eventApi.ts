import type { Event, CreateEventPayload} from './event.types';

export const fetchEvents = async (): Promise<Event[]> => {
  const response = await fetch('http://localhost:8000/api/v1/events/')
  if (!response.ok) {
    throw new Error('Could not connect to the backend. Is it actually running?')
  }
  return response.json()
}

export const createEvent = async (payload: CreateEventPayload): Promise<Event[]> => {
  const response = await fetch('http://localhost:8000/api/v1/events/',{
    method: 'POST',
    headers: {'Content-Type' : 'application/json',
  },
  body: JSON.stringify(payload), //converts JS object to JSON
});
if (!response.ok) {
    throw new Error('Failed to create event');
  }

  return response.json();
};