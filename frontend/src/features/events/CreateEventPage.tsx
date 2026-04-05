import { useState } from 'react';
import { createEvent } from './eventApi';

function CreateEventPage(){

    const [formData, setFormData] = useState({
  title: '',
  subtitle: '',
  description: '',
  capacity: '',
});
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [success, setSuccess] = useState('');

    function handleChange(
        event : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>){

        const {name, value} = event.target;

        setFormData((prev) => ({
            ...prev,
            [name] : value,
        }));
        
        
    }

    async function handleSubmit(event: React.FormEvent){

    event.preventDefault();
    
    setLoading(true);
    setSuccess('');
    setError('');

    try {
        const payload = {
            ...formData,
      capacity: formData.capacity ? Number(formData.capacity) : undefined,
        };
        await createEvent(payload);

        setSuccess('Event created successfully');

        setFormData({
            title: '',
            subtitle: '',
            description: '',
            capacity: '',
        });
    }catch (err) {
    setError('Failed to create event');
  } finally {
    setLoading(false);
  }

    }

    return (
<div className="create-event-page"> 
  <div className="container">
    <header className="header">
      <h1 className="title">Create Event</h1>
      <p className="subtitle">Add a new event</p>
    </header>
<div className="event-card">
    <form onSubmit={handleSubmit}>
      <input
        name="title"
        placeholder="Title"
        value={formData.title}
        onChange={handleChange}
      />

      <input
        name="subtitle"
        placeholder="Subtitle"
        value={formData.subtitle}
        onChange={handleChange}
      />

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
      />

      <input
        type = "number"
        name="capacity"
        placeholder="Capacity"
        value={formData.capacity}
        onChange={handleChange}
      />

      <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Event'}
        </button>
    </form>

    {error && <p style={{ color: 'red' }}>{error}</p>}
    {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  </div>
  </div>
);
}
export default CreateEventPage;