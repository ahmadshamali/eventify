import {createEvent} from './eventApi';
import {useMutation} from "@tanstack/react-query";
import type {CreateEventPayload} from "./event.types.ts";
import * as z from "zod";
import {type SubmitHandler, useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({
    title: z.string().min(1, {message: 'Title is required'}).max(100, {message: 'Title must be at most 100 characters'}),
    subtitle: z.string().min(1, {message: 'Subtitle is required'}).max(100, {message: 'Subtitle must be at most 100 characters'}),
    description: z.string().max(200, {message: 'Description must be at most 200 characters'}),
    capacity: z.string().regex(/^\d*$/, {message: 'Capacity must be a whole number'}),
});

type EventInputs = {
    title: string
    subtitle: string
    description: string
    capacity: string
}

function CreateEventPage() {

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EventInputs>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: '',
            subtitle: '',
            description: '',
            capacity: '',
        }
    });

    // Validation

    const {isPending: isLoading, error, mutateAsync: createEventAsync} = useMutation({
       mutationFn: async (payload: CreateEventPayload) => {
           await createEvent(payload);
       },
    });

    const buildPayload = (data: EventInputs): CreateEventPayload => ({
        title: data.title.trim(),
        subtitle: data.subtitle.trim(),
        description: data.description.trim() || undefined,
        capacity: data.capacity.trim() ? Number(data.capacity) : undefined,
    });

    const onSubmit: SubmitHandler<EventInputs> = (data) => createEventAsync(buildPayload(data));

    return (
        <div className="create-event-page">
            <div className="container">
                <header className="header">
                    <h1 className="title">Create Event</h1>
                    <p className="subtitle">Add a new event</p>
                </header>
                <div className="event-card">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <input placeholder={'title'} {...register('title')}/>

                        {errors.title && (
                            <p style={{color: 'red'}}>{errors.title.message}</p>
                        )}

                        <input placeholder={'subtitle'} {...register('subtitle')}/>

                        {errors.subtitle && (
                            <p style={{color: 'red'}}>{errors.subtitle.message}</p>
                        )}

                        <textarea placeholder={'description'} {...register('description')}/>

                        {errors.description && (
                            <p style={{color: 'red'}}>{errors.description.message}</p>
                        )}

                        <input placeholder={'capacity'} {...register('capacity')}/>

                        {errors.capacity && (
                            <p style={{color: 'red'}}>{errors.capacity.message}</p>
                        )}

                        <button className="btn" type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Event'}
                        </button>
                    </form>

                    {error && <p style={{color: 'red'}}>{error.message}</p>}
                </div>
            </div>
        </div>
    );
}

export default CreateEventPage;