export interface Event {
  id: number;
  title: string;
  subtitle: string;
  description: string | null;
  capacity: number | null;
  created_at: string;
}

export interface CreateEventPayload{
  title: string;
  subtitle? : string;
  description? : string;
  capacity? : number;
}