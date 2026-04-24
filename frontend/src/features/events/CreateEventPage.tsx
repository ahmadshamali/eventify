import {createEvent} from './eventApi';
import {useMutation} from "@tanstack/react-query";
import type {CreateEventPayload} from "./event.types.ts";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchEvents, updateEvent } from './eventApi'
import type { UpdateEventPayload } from './event.types'

const schema = z.object({
        title: z.string().min(1, {message: 'Title is required'}).max(100, {message: 'Title must be at most 100 characters'}),
        description: z.string().min(1, {message: 'Description is required'}).max(1000, {message: 'Description must be at most 1000 characters'}),
        date: z.string().min(1, { message: 'Date is required' }),
        time: z.string().min(1, { message: 'Time is required' }),
        location: z.string().min(1, { message: 'Location is required' }).max(255, { message: 'Location must be at most 255 characters' }),
        category: z.enum([
            'Technology',
            'Business & Entrepreneurship',
            'Education & Workshops',
            'Sports & Fitness',
            'Arts & Culture',
        ]),
        capacity: z.coerce.number().int().positive({message: 'Capacity must be a positive number'}),
});

type EventFormInput = z.input<typeof schema>
type EventFormValues = z.output<typeof schema>

function CreateEventPage() {
        const { eventId } = useParams<{ eventId: string }>()
        const navigate = useNavigate()
        const queryClient = useQueryClient()
        const editingEventId = eventId ? Number(eventId) : null
        const isEditMode = Number.isInteger(editingEventId)

        const { data: events = [] } = useQuery({
            queryKey: ['events'],
            queryFn: fetchEvents,
        })

        const editingEvent = events.find((item) => item.id === editingEventId)

    const {
        register,
        handleSubmit,
                reset,
        formState: { errors },
    } = useForm<EventFormInput, unknown, EventFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: '',
            description: '',
                        date: '',
                        time: '',
                        location: '',
                        category: 'Technology',
                        capacity: 1,
        }
    });

        useEffect(() => {
            if (!editingEvent) {
                return
            }

            const eventDate = new Date(editingEvent.startDateTime)
            const date = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`
            const time = `${String(eventDate.getHours()).padStart(2, '0')}:${String(eventDate.getMinutes()).padStart(2, '0')}`

            reset({
                title: editingEvent.title,
                description: editingEvent.description ?? '',
                date,
                time,
                location: editingEvent.location,
                category: editingEvent.category,
                capacity: editingEvent.capacity,
            })
        }, [editingEvent, reset])

        const {isPending: isLoading, error, mutateAsync: submitMutation} = useMutation({
             mutationFn: async (payload: CreateEventPayload | UpdateEventPayload) => {
                 if (isEditMode && editingEventId) {
                     return updateEvent(editingEventId, payload)
                 }
                 return createEvent(payload as CreateEventPayload)
             },
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: ['events'] })
                navigate('/events')
            },
    });

        const buildPayload = (data: EventFormValues): CreateEventPayload => ({
        title: data.title.trim(),
                description: data.description.trim(),
                startDateTime: new Date(`${data.date}T${data.time}:00`).toISOString(),
                location: data.location.trim(),
                category: data.category,
                capacity: data.capacity,
    });

        const onSubmit = (data: EventFormValues) => submitMutation(buildPayload(data));

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-900 px-5 py-10 text-slate-50">
            <div className="pointer-events-none fixed -left-52 -top-52 h-[600px] w-[600px] rounded-full bg-blue-500/35 blur-[100px]" />
            <div className="pointer-events-none fixed -bottom-52 -right-52 h-[600px] w-[600px] rounded-full bg-cyan-500/25 blur-[100px]" />

            <div className="relative mx-auto w-full max-w-[600px]">
                <header className="mb-14 text-center">
                    <h1 className="mb-4 bg-gradient-to-br from-white to-slate-300 bg-clip-text text-5xl font-bold tracking-tight text-transparent">
                                            {isEditMode ? 'Update Event' : 'Create Event'}
                    </h1>
                                        <p className="text-xl font-light text-slate-400">
                                            {isEditMode ? 'Edit your event details' : 'Add a new event'}
                                        </p>
                </header>
                <div className="rounded-2xl border border-white/10 bg-slate-800/70 p-8 backdrop-blur-md">
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                        <input
                          className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-[15px] text-slate-100 outline-none transition focus:border-blue-500"
                          placeholder={'title'}
                          {...register('title')}
                        />

                        {errors.title && (
                            <p className="text-sm text-red-400">{errors.title.message}</p>
                        )}

                        <textarea
                          className="min-h-[100px] w-full resize-y rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-[15px] text-slate-100 outline-none transition focus:border-blue-500"
                          placeholder={'description'}
                          {...register('description')}
                        />

                        {errors.description && (
                            <p className="text-sm text-red-400">{errors.description.message}</p>
                        )}

                                                <input
                                                    type="date"
                                                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-[15px] text-slate-100 outline-none transition focus:border-blue-500"
                                                    {...register('date')}
                                                />

                                                {errors.date && (
                                                    <p className="text-sm text-red-400">{errors.date.message}</p>
                                                )}

                                                <input
                                                    type="time"
                                                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-[15px] text-slate-100 outline-none transition focus:border-blue-500"
                                                    {...register('time')}
                                                />

                                                {errors.time && (
                                                    <p className="text-sm text-red-400">{errors.time.message}</p>
                                                )}

                                                <input
                                                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-[15px] text-slate-100 outline-none transition focus:border-blue-500"
                                                    placeholder={'location'}
                                                    {...register('location')}
                                                />

                                                {errors.location && (
                                                    <p className="text-sm text-red-400">{errors.location.message}</p>
                                                )}

                                                <select
                                                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-[15px] text-slate-100 outline-none transition focus:border-blue-500"
                                                    {...register('category')}
                                                >
                                                    <option value="Technology">Technology</option>
                                                    <option value="Business & Entrepreneurship">Business & Entrepreneurship</option>
                                                    <option value="Education & Workshops">Education & Workshops</option>
                                                    <option value="Sports & Fitness">Sports & Fitness</option>
                                                    <option value="Arts & Culture">Arts & Culture</option>
                                                </select>

                                                {errors.category && (
                                                    <p className="text-sm text-red-400">{errors.category.message}</p>
                                                )}

                        <input
                                                    type="number"
                                                    min={1}
                          className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-[15px] text-slate-100 outline-none transition focus:border-blue-500"
                          placeholder={'capacity'}
                          {...register('capacity')}
                        />

                        {errors.capacity && (
                            <p className="text-sm text-red-400">{errors.capacity.message}</p>
                        )}

                        <button
                          className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] disabled:cursor-wait disabled:opacity-70"
                          type="submit"
                          disabled={isLoading}
                        >
                                                        {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Event' : 'Create Event')}
                        </button>
                    </form>

                    {error && <p className="mt-4 text-sm text-red-400">{error.message}</p>}
                </div>
            </div>
        </div>
    );
}

export default CreateEventPage;