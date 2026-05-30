import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'

import { useToast } from '../../context/ToastContext'
import EventPageBackdrop from '../../shared/components/events/EventPageBackdrop'
import { createEvent, fetchEvents, generateEventDescription, updateEvent, uploadEventImage } from './eventApi'
import type { Event } from './event.types'
import {
    buildEventPayload,
    defaultEventFormValues,
    eventCategories,
    eventFormSchema,
    mapEventToFormValues,
    type EventFormInput,
    type EventFormValues,
} from './eventForm'

function CreateEventPage() {
        const { eventId } = useParams<{ eventId: string }>()
        const navigate = useNavigate()
        const queryClient = useQueryClient()
        const { addToast } = useToast()
        const editingEventId = eventId ? Number(eventId) : null
        const isEditMode = Number.isInteger(editingEventId)

        const { data: events = [] } = useQuery<Event[]>({
            queryKey: ['events'],
            queryFn: () => fetchEvents(),
        })

    const editingEvent = events.find((item) => item.id === editingEventId)

    const {
        register,
        handleSubmit,
        reset,
        getValues,
        setValue,
        watch,
        formState: { errors },
    } = useForm<EventFormInput, unknown, EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: defaultEventFormValues,
    })

    const [additionalDetails, setAdditionalDetails] = useState('')
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [imageUploadError, setImageUploadError] = useState('')
    const watchedStartDate = watch('date')
    const watchedEndDate = watch('endDate')

        useEffect(() => {
            if (!editingEvent) {
                return
            }

            reset(mapEventToFormValues(editingEvent))
        }, [editingEvent, reset])

    useEffect(() => {
        if (!watchedStartDate || watchedEndDate) {
            return
        }

        setValue('endDate', watchedStartDate, { shouldValidate: true, shouldDirty: true })
    }, [setValue, watchedEndDate, watchedStartDate])

        const {isPending: isLoading, error, mutateAsync: submitMutation} = useMutation({
             mutationFn: async (payload: EventFormValues) => {
                 const eventPayload = buildEventPayload(payload)

                 if (isEditMode && editingEventId) {
                     return updateEvent(editingEventId, eventPayload)
                 }

                 return createEvent(eventPayload)
             },
            onSuccess: async (data) => {
                await queryClient.invalidateQueries({ queryKey: ['events'] })
                if (isEditMode) {
                    addToast(`Event "${data.title}" updated successfully!`, 'success')
                } else {
                    addToast(`Event "${data.title}" created successfully!`, 'success')
                }
                navigate('/events')
            },
    });

        const onSubmit = (data: EventFormValues) => submitMutation(data)

        const {
            mutateAsync: generateDescriptionAsync,
            isPending: isGeneratingDescription,
            error: generateError,
        } = useMutation({
            mutationFn: async () => {
                const values = getValues()
                return generateEventDescription({
                    title: values.title,
                    category: values.category,
                    additional_details: additionalDetails.trim() || undefined,
                })
            },
            onSuccess: (data) => {
                setValue('description', data.description, { shouldValidate: true, shouldDirty: true })
                addToast('Description generated successfully!', 'success')
            },
        })

        const handleGenerateDescription = async () => {
            await generateDescriptionAsync()
        }

        const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0]
            if (!file) {
                return
            }

            setImageUploadError('')
            setIsUploadingImage(true)

            try {
                const result = await uploadEventImage(file)
                // Some servers return a relative path (e.g. "/uploads/..png" or "uploads/..png").
                // The form schema expects an absolute URL, so normalize here.
                const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'
                let apiOrigin = window.location.origin
                try {
                    apiOrigin = new URL(apiBase).origin
                } catch {
                    apiOrigin = window.location.origin
                }

                let imageUrl = result.imageUrl || ''
                const isAbsolute = /^(https?:)?\/\//i.test(imageUrl)
                if (!isAbsolute) {
                    // Ensure leading slash
                    if (!imageUrl.startsWith('/')) {
                        imageUrl = `/${imageUrl}`
                    }
                    imageUrl = `${apiOrigin}${imageUrl}`
                }

                setValue('imageUrl', imageUrl, { shouldValidate: true, shouldDirty: true })
                addToast('Image uploaded successfully', 'success')
            } catch (uploadError) {
                const message = uploadError instanceof Error ? uploadError.message : 'Failed to upload image'
                setImageUploadError(message)
            } finally {
                setIsUploadingImage(false)
                event.target.value = ''
            }
        }

    return (
        <div className="min-h-[calc(100vh-4rem)] px-4 py-8 md:px-8">
            <EventPageBackdrop />

            <div className="mx-auto w-full max-w-5xl">
                <header className="mb-8 rounded-xl border border-[#4f4633] bg-[#131b2e] p-6 shadow-sm md:p-8">
                    <p className="font-mono text-xs uppercase tracking-widest text-[#ffe1a7]">Create Event</p>
                    <h1 className="mt-2 font-['Hanken_Grotesk'] text-4xl font-semibold tracking-tight text-[#dae2fd]">
                        {isEditMode ? 'Update Event' : 'Create Event'}
                    </h1>
                    <p className="mt-2 text-[#d3c5ac]">
                        {isEditMode ? 'Edit your event details.' : 'Fill in the details below to publish a new institutional event.'}
                    </p>
                </header>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <aside className="lg:col-span-3">
                        <div className="sticky top-24 space-y-2 rounded-xl border border-[#4f4633] bg-[#131b2e] p-4">
                            {['Basic Info', 'Description', 'Schedule', 'Publish'].map((step, index) => (
                                <div
                                    key={step}
                                    className={[
                                        'flex items-center gap-3 border-l-4 px-4 py-3',
                                        index === 0
                                            ? 'border-[#f9bd22] bg-[#222a3d] text-[#ffe1a7]'
                                            : 'border-[#4f4633] text-[#d3c5ac]',
                                    ].join(' ')}
                                >
                                    <span className={[
                                        'flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold',
                                        index === 0 ? 'bg-[#fbbf24] text-[#402d00]' : 'bg-[#2d3449] text-[#d3c5ac]',
                                    ].join(' ')}>
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span className="font-mono text-xs uppercase tracking-wider">{step}</span>
                                </div>
                            ))}
                        </div>
                    </aside>
                    <div className="rounded-xl border border-[#4f4633] bg-[#131b2e] p-6 shadow-sm md:p-8 lg:col-span-9">
                    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
                        <section className="rounded-xl border border-[#4f4633] bg-[#0b1326] p-5">
                            <h2 className="mb-4 font-['Hanken_Grotesk'] text-xl font-semibold text-[#dae2fd]">Event Details</h2>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <input
                                      className="w-full rounded-lg border border-[#4f4633] bg-[#131b2e] px-4 py-3 text-[#dae2fd] outline-none transition placeholder:text-[#d3c5ac]/60 focus:border-[#f9bd22] focus:ring-2 focus:ring-[#f9bd22]/20"
                                      placeholder={'title'}
                                      {...register('title')}
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-[#ffb4ab]">{errors.title.message}</p>}
                                </div>

                                <div>
                                    <textarea
                                      className="min-h-[120px] w-full resize-y rounded-lg border border-[#4f4633] bg-[#131b2e] px-4 py-3 text-[#dae2fd] outline-none transition placeholder:text-[#d3c5ac]/60 focus:border-[#f9bd22] focus:ring-2 focus:ring-[#f9bd22]/20"
                                      placeholder={'description'}
                                      {...register('description')}
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-[#ffb4ab]">{errors.description.message}</p>}
                                </div>

                                <div>
                                    <textarea
                                      className="min-h-[90px] w-full resize-y rounded-lg border border-[#4f4633] bg-[#131b2e] px-4 py-3 text-[#dae2fd] outline-none transition placeholder:text-[#d3c5ac]/60 focus:border-[#f9bd22] focus:ring-2 focus:ring-[#f9bd22]/20"
                                      placeholder={'additional details for AI description (optional)'}
                                      value={additionalDetails}
                                      onChange={(event) => setAdditionalDetails(event.target.value)}
                                    />
                                    <div className="mt-2 flex items-center justify-between gap-3">
                                        <p className="text-xs text-[#d3c5ac]">AI uses title, category, and these details.</p>
                                        <button
                                            type="button"
                                            onClick={handleGenerateDescription}
                                            disabled={isGeneratingDescription}
                                            className="rounded-lg border border-[#34daff]/40 bg-[#00a6e0]/20 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#b6edff] transition hover:bg-[#00a6e0]/30 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isGeneratingDescription ? 'Generating...' : 'Generate Description'}
                                        </button>
                                    </div>
                                    {generateError ? (
                                        <p className="mt-1 text-sm text-[#ffb4ab]">{generateError.message}</p>
                                    ) : null}
                                </div>

                                <div>
                                    <select
                                        className="w-full rounded-lg border border-[#4f4633] bg-[#131b2e] px-4 py-3 text-[#dae2fd] outline-none transition focus:border-[#f9bd22] focus:ring-2 focus:ring-[#f9bd22]/20"
                                        {...register('category')}
                                    >
                                        {eventCategories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && <p className="mt-1 text-sm text-[#ffb4ab]">{errors.category.message}</p>}
                                </div>

                                <div className="rounded-xl border border-[#4f4633] bg-[#131b2e] p-4">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-[#dae2fd]">Event Image</p>
                                            <p className="text-xs text-[#d3c5ac]">Upload from device or paste an image URL</p>
                                        </div>
                                        <label className="cursor-pointer rounded-lg border border-[#34daff]/40 bg-[#00a6e0]/20 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#b6edff] transition hover:bg-[#00a6e0]/30">
                                            {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                                        </label>
                                    </div>
                                    <input
                                        type="url"
                                        className="w-full rounded-lg border border-[#4f4633] bg-[#0b1326] px-4 py-3 text-[#dae2fd] outline-none transition placeholder:text-[#d3c5ac]/60 focus:border-[#f9bd22] focus:ring-2 focus:ring-[#f9bd22]/20"
                                        placeholder={'image URL (optional)'}
                                        {...register('imageUrl')}
                                    />
                                    {imageUploadError ? <p className="mt-1 text-sm text-[#ffb4ab]">{imageUploadError}</p> : null}
                                    {errors.imageUrl && <p className="mt-1 text-sm text-[#ffb4ab]">{errors.imageUrl.message}</p>}
                                </div>

                                                                <div>
                                    <input
                                      type="url"
                                      className="w-full rounded-lg border border-[#4f4633] bg-[#131b2e] px-4 py-3 text-[#dae2fd] outline-none transition placeholder:text-[#d3c5ac]/60 focus:border-[#f9bd22] focus:ring-2 focus:ring-[#f9bd22]/20"
                                      placeholder={'event link (optional)'}
                                      {...register('eventLink')}
                                    />
                                    {errors.eventLink && <p className="mt-1 text-sm text-[#ffb4ab]">{errors.eventLink.message}</p>}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#4f4633] bg-[#0b1326] p-5">
                            <h2 className="mb-4 font-['Hanken_Grotesk'] text-xl font-semibold text-[#dae2fd]">Schedule and Capacity</h2>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <input
                                        type="date"
                                        lang="en-GB"
                                        style={{ colorScheme: 'dark' }}
                                        className="w-full rounded-lg border border-[#4f4633] bg-[#131b2e] px-4 py-3 text-[#dae2fd] outline-none transition focus:border-[#f9bd22] focus:ring-2 focus:ring-[#f9bd22]/20"
                                        {...register('date')}
                                    />
                                    {errors.date && <p className="mt-1 text-sm text-[#ffb4ab]">{errors.date.message}</p>}
                                </div>

                                <div>
                                    <input
                                        type="time"
                                        style={{ colorScheme: 'dark' }}
                                        className="w-full rounded-lg border border-[#4f4633] bg-[#131b2e] px-4 py-3 text-[#dae2fd] outline-none transition focus:border-[#f9bd22] focus:ring-2 focus:ring-[#f9bd22]/20"
                                        {...register('time')}
                                    />
                                    {errors.time && <p className="mt-1 text-sm text-[#ffb4ab]">{errors.time.message}</p>}
                                </div>

                                <div>
                                    <input
                                        type="date"
                                        lang="en-GB"
                                        style={{ colorScheme: 'dark' }}
                                        className="w-full rounded-lg border border-[#4f4633] bg-[#131b2e] px-4 py-3 text-[#dae2fd] outline-none transition focus:border-[#f9bd22] focus:ring-2 focus:ring-[#f9bd22]/20"
                                        {...register('endDate')}
                                    />
                                    {errors.endDate && <p className="mt-1 text-sm text-[#ffb4ab]">{errors.endDate.message}</p>}
                                </div>

                                <div>
                                    <input
                                        type="time"
                                        style={{ colorScheme: 'dark' }}
                                        className="w-full rounded-lg border border-[#4f4633] bg-[#131b2e] px-4 py-3 text-[#dae2fd] outline-none transition focus:border-[#f9bd22] focus:ring-2 focus:ring-[#f9bd22]/20"
                                        {...register('endTime')}
                                    />
                                    {errors.endTime && <p className="mt-1 text-sm text-[#ffb4ab]">{errors.endTime.message}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <input
                                        className="w-full rounded-lg border border-[#4f4633] bg-[#131b2e] px-4 py-3 text-[#dae2fd] outline-none transition placeholder:text-[#d3c5ac]/60 focus:border-[#f9bd22] focus:ring-2 focus:ring-[#f9bd22]/20"
                                        placeholder={'location'}
                                        {...register('location')}
                                    />
                                    {errors.location && <p className="mt-1 text-sm text-[#ffb4ab]">{errors.location.message}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <input
                                        type="number"
                                        min={1}
                                        className="w-full rounded-lg border border-[#4f4633] bg-[#131b2e] px-4 py-3 text-[#dae2fd] outline-none transition placeholder:text-[#d3c5ac]/60 focus:border-[#f9bd22] focus:ring-2 focus:ring-[#f9bd22]/20"
                                        placeholder={'capacity'}
                                        {...register('capacity')}
                                    />
                                    {errors.capacity && <p className="mt-1 text-sm text-[#ffb4ab]">{errors.capacity.message}</p>}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#4f4633] bg-[#0b1326] p-5">
                            <div className="flex flex-col gap-4">
                                <button
                                    className="rounded-lg bg-[#fbbf24] px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#402d00] transition hover:bg-[#f9bd22] disabled:cursor-wait disabled:opacity-70"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Event' : 'Create Event')}
                                </button>
                            </div>
                        </section>
                    </form>

                    {error && <p className="mt-4 text-sm text-[#ffb4ab]">{error.message}</p>}
                </div>
            </div>
        </div>
        </div>
    );
}

export default CreateEventPage;
