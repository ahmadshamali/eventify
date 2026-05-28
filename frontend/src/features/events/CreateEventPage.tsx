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
                setValue('imageUrl', result.imageUrl, { shouldValidate: true, shouldDirty: true })
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
        <div className="relative min-h-screen overflow-hidden bg-slate-900 px-5 py-10 text-slate-50">
            <EventPageBackdrop />

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
                    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
                        <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
                            <h2 className="mb-4 text-lg font-semibold text-white">Event Details</h2>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <input
                                      className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-[15px] text-slate-100 outline-none transition focus:border-blue-500"
                                      placeholder={'title'}
                                      {...register('title')}
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>}
                                </div>

                                <div>
                                    <textarea
                                      className="min-h-[120px] w-full resize-y rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-[15px] text-slate-100 outline-none transition focus:border-blue-500"
                                      placeholder={'description'}
                                      {...register('description')}
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>}
                                </div>

                                <div>
                                    <textarea
                                      className="min-h-[90px] w-full resize-y rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-[15px] text-slate-100 outline-none transition focus:border-blue-500"
                                      placeholder={'additional details for AI description (optional)'}
                                      value={additionalDetails}
                                      onChange={(event) => setAdditionalDetails(event.target.value)}
                                    />
                                    <div className="mt-2 flex items-center justify-between gap-3">
                                        <p className="text-xs text-slate-400">AI uses title, category, and these details.</p>
                                        <button
                                            type="button"
                                            onClick={handleGenerateDescription}
                                            disabled={isGeneratingDescription}
                                            className="rounded-lg border border-cyan-400/40 bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isGeneratingDescription ? 'Generating...' : 'Generate Description'}
                                        </button>
                                    </div>
                                    {generateError ? (
                                        <p className="mt-1 text-sm text-red-400">{generateError.message}</p>
                                    ) : null}
                                </div>

                                <div>
                                    <select
                                        className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-[15px] text-slate-100 outline-none transition focus:border-blue-500"
                                        {...register('category')}
                                    >
                                        {eventCategories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && <p className="mt-1 text-sm text-red-400">{errors.category.message}</p>}
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-slate-900/30 p-4">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">Event Image</p>
                                            <p className="text-xs text-slate-400">Upload from device or paste an image URL</p>
                                        </div>
                                        <label className="cursor-pointer rounded-lg border border-cyan-400/40 bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/30">
                                            {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                                        </label>
                                    </div>
                                    <input
                                        type="url"
                                        className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-[15px] text-slate-100 outline-none transition focus:border-blue-500"
                                        placeholder={'image URL (optional)'}
                                        {...register('imageUrl')}
                                    />
                                    {imageUploadError ? <p className="mt-1 text-sm text-red-400">{imageUploadError}</p> : null}
                                    {errors.imageUrl && <p className="mt-1 text-sm text-red-400">{errors.imageUrl.message}</p>}
                                </div>

                                                                <div>
                                    <input
                                      type="url"
                                      className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-[15px] text-slate-100 outline-none transition focus:border-blue-500"
                                      placeholder={'event link (optional)'}
                                      {...register('eventLink')}
                                    />
                                    {errors.eventLink && <p className="mt-1 text-sm text-red-400">{errors.eventLink.message}</p>}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
                            <h2 className="mb-4 text-lg font-semibold text-white">Schedule and Capacity</h2>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <input
                                        type="date"
                                        lang="en-GB"
                                        style={{ colorScheme: 'dark' }}
                                        className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-[15px] text-slate-100 outline-none transition focus:border-blue-500"
                                        {...register('date')}
                                    />
                                    {errors.date && <p className="mt-1 text-sm text-red-400">{errors.date.message}</p>}
                                </div>

                                <div>
                                    <input
                                        type="time"
                                        style={{ colorScheme: 'dark' }}
                                        className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-[15px] text-slate-100 outline-none transition focus:border-blue-500"
                                        {...register('time')}
                                    />
                                    {errors.time && <p className="mt-1 text-sm text-red-400">{errors.time.message}</p>}
                                </div>

                                <div>
                                    <input
                                        type="date"
                                        lang="en-GB"
                                        style={{ colorScheme: 'dark' }}
                                        className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-[15px] text-slate-100 outline-none transition focus:border-blue-500"
                                        {...register('endDate')}
                                    />
                                    {errors.endDate && <p className="mt-1 text-sm text-red-400">{errors.endDate.message}</p>}
                                </div>

                                <div>
                                    <input
                                        type="time"
                                        style={{ colorScheme: 'dark' }}
                                        className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-[15px] text-slate-100 outline-none transition focus:border-blue-500"
                                        {...register('endTime')}
                                    />
                                    {errors.endTime && <p className="mt-1 text-sm text-red-400">{errors.endTime.message}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <input
                                        className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-[15px] text-slate-100 outline-none transition focus:border-blue-500"
                                        placeholder={'location'}
                                        {...register('location')}
                                    />
                                    {errors.location && <p className="mt-1 text-sm text-red-400">{errors.location.message}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <input
                                        type="number"
                                        min={1}
                                        className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-[15px] text-slate-100 outline-none transition focus:border-blue-500"
                                        placeholder={'capacity'}
                                        {...register('capacity')}
                                    />
                                    {errors.capacity && <p className="mt-1 text-sm text-red-400">{errors.capacity.message}</p>}
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
                            <div className="flex flex-col gap-4">
                                <button
                                    className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] disabled:cursor-wait disabled:opacity-70"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Event' : 'Create Event')}
                                </button>
                            </div>
                        </section>
                    </form>

                    {error && <p className="mt-4 text-sm text-red-400">{error.message}</p>}
                </div>
            </div>
        </div>
    );
}

export default CreateEventPage;