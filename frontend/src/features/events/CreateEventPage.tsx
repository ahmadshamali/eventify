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

const universityBuildings = [
    'A.Shaheen',
    'Masruji',
    'Bahrain',
    'Aggad',
    'WKS',
    'Masri',
    'Bamieh',
    'EL-haj',
    'GYM',
    'Al.Juraysi',
    'O.Abdulhadi',
    'Alsadik',
    'IOL',
    'PNH',
    'Darwazah',
    'SCI',
    'S.Abdulhadi',
    'N.Shaheen',
    'Aweidah',
    'Alghanim',
    'Maktoum',
    'KNH',
    'NSA',
    'Sh.Shaheen',
    'Zeenni',
    'Khoury',
] as const

const buildingPattern = universityBuildings.map((building) => building.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')

const buildLocationValue = (building: string, roomHall: string) => {
    const trimmedBuilding = building.trim()
    const trimmedRoomHall = roomHall.trim()

    return trimmedRoomHall ? `${trimmedBuilding} - ${trimmedRoomHall}` : trimmedBuilding
}

const splitLocationValue = (location: string) => {
    const trimmedLocation = location.trim()
    const building = universityBuildings.find((item) => trimmedLocation === item || trimmedLocation.startsWith(`${item} - `))

    if (!building) {
        return { building: trimmedLocation, roomHall: '' }
    }

    return {
        building,
        roomHall: trimmedLocation === building ? '' : trimmedLocation.slice(`${building} - `.length),
    }
}

const getTomorrowDateInputValue = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
}

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
    const [activeStep, setActiveStep] = useState(0)
    const [selectedBuilding, setSelectedBuilding] = useState('')
    const [roomHall, setRoomHall] = useState('')
    const watchedStartDate = watch('date')
    const watchedEndDate = watch('endDate')
    const minimumEventDate = getTomorrowDateInputValue()

        useEffect(() => {
            if (!editingEvent) {
                return
            }

            reset(mapEventToFormValues(editingEvent))
            const locationParts = splitLocationValue(editingEvent.location)
            setSelectedBuilding(locationParts.building)
            setRoomHall(locationParts.roomHall)
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

        const syncLocationValue = (building: string, roomHallValue: string) => {
            setValue('location', buildLocationValue(building, roomHallValue), { shouldValidate: true, shouldDirty: true })
        }

        const handleBuildingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const building = event.target.value
            setSelectedBuilding(building)
            syncLocationValue(building, roomHall)
        }

        const handleRoomHallChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value
            setRoomHall(value)
            syncLocationValue(selectedBuilding, value)
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
        <div className="create-event-page min-h-[calc(100vh-4rem)] px-4 py-8 md:px-8">
            <EventPageBackdrop />

            <div className="mx-auto w-full max-w-5xl">
                <header className="mb-8 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-6 shadow-sm md:p-8">
                    <p className="font-mono text-xs uppercase tracking-widest text-[var(--primary)]">Create Event</p>
                    <h1 className="mt-2 font-['Hanken_Grotesk'] text-4xl font-semibold tracking-tight text-[var(--on-surface)]">
                        {isEditMode ? 'Update Event' : 'Create Event'}
                    </h1>
                    <p className="mt-2 text-[var(--on-surface-variant)]">
                        {isEditMode ? 'Edit your event details.' : 'Fill in the details below to publish a new institutional event.'}
                    </p>
                </header>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <aside className="lg:col-span-3">
                        <div className="create-event-stepper sticky top-24 space-y-2 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4">
                            {['Basic Info', 'Description', 'Schedule and Capacity', 'Publish'].map((step, index) => (
                                <div
                                    key={step}
                                    data-active={index === activeStep}
                                    className={[
                                        'create-event-step flex items-center gap-3 border-l-4 px-4 py-3',
                                        index === activeStep
                                            ? 'border-[var(--primary-fixed-dim)] bg-[var(--surface-container-high)] text-[var(--primary)]'
                                            : 'border-[var(--outline-variant)] text-[var(--on-surface-variant)]',
                                    ].join(' ')}
                                >
                                    <span className={[
                                        'create-event-step-number flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold',
                                        index === activeStep ? 'bg-[var(--primary-container)] text-[var(--on-primary)]' : 'bg-[var(--surface-container-highest)] text-[var(--on-surface-variant)]',
                                    ].join(' ')}>
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span className="create-event-step-label font-mono text-xs uppercase tracking-wider">{step}</span>
                                </div>
                            ))}
                        </div>
                    </aside>
                    <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-6 shadow-sm md:p-8 lg:col-span-9">
                    <form
                        className="flex flex-col gap-5"
                        onSubmitCapture={() => syncLocationValue(selectedBuilding, roomHall)}
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <section
                            className="rounded-xl border border-[var(--outline-variant)] bg-[var(--background)] p-5"
                            onFocusCapture={() => setActiveStep(0)}
                        >
                            <h2 className="mb-4 font-['Hanken_Grotesk'] text-xl font-semibold text-[var(--on-surface)]">Event Details</h2>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <input
                                      className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3 text-[var(--on-surface)] outline-none transition placeholder:text-[var(--on-surface-variant)]/60 focus:border-[var(--primary-fixed-dim)] focus:ring-2 focus:ring-[var(--primary-fixed-dim)]/20"
                                      placeholder={'title'}
                                      {...register('title')}
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-[var(--error)]">{errors.title.message}</p>}
                                </div>

                                <div>
                                    <select
                                        className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3 text-[var(--on-surface)] outline-none transition focus:border-[var(--primary-fixed-dim)] focus:ring-2 focus:ring-[var(--primary-fixed-dim)]/20"
                                        {...register('category')}
                                    >
                                        {eventCategories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && <p className="mt-1 text-sm text-[var(--error)]">{errors.category.message}</p>}
                                </div>

                                <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-4">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-[var(--on-surface)]">Event Image</p>
                                            <p className="text-xs text-[var(--on-surface-variant)]">Upload from device or paste an image URL</p>
                                        </div>
                                        <label
                                            className="create-event-upload-button cursor-pointer rounded-lg border border-[var(--tertiary-container)]/40 bg-[var(--secondary-container)]/20 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--tertiary)] transition hover:bg-[var(--secondary-container)]/30"
                                            onClick={() => setActiveStep(0)}
                                        >
                                            {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                                        </label>
                                    </div>
                                    <input
                                        type="url"
                                        className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--background)] px-4 py-3 text-[var(--on-surface)] outline-none transition placeholder:text-[var(--on-surface-variant)]/60 focus:border-[var(--primary-fixed-dim)] focus:ring-2 focus:ring-[var(--primary-fixed-dim)]/20"
                                        placeholder={'image URL (optional)'}
                                        {...register('imageUrl')}
                                    />
                                    {imageUploadError ? <p className="mt-1 text-sm text-[var(--error)]">{imageUploadError}</p> : null}
                                    {errors.imageUrl && <p className="mt-1 text-sm text-[var(--error)]">{errors.imageUrl.message}</p>}
                                </div>

                                <div>
                                    <input
                                      type="url"
                                      className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3 text-[var(--on-surface)] outline-none transition placeholder:text-[var(--on-surface-variant)]/60 focus:border-[var(--primary-fixed-dim)] focus:ring-2 focus:ring-[var(--primary-fixed-dim)]/20"
                                      placeholder={'event link (optional)'}
                                      {...register('eventLink')}
                                    />
                                    {errors.eventLink && <p className="mt-1 text-sm text-[var(--error)]">{errors.eventLink.message}</p>}
                                </div>

                            </div>
                        </section>

                        <section
                            className="rounded-xl border border-[var(--outline-variant)] bg-[var(--background)] p-5"
                            onFocusCapture={() => setActiveStep(1)}
                        >
                            <h2 className="mb-4 font-['Hanken_Grotesk'] text-xl font-semibold text-[var(--on-surface)]">Description</h2>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <textarea
                                      className="min-h-[120px] w-full resize-y rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3 text-[var(--on-surface)] outline-none transition placeholder:text-[var(--on-surface-variant)]/60 focus:border-[var(--primary-fixed-dim)] focus:ring-2 focus:ring-[var(--primary-fixed-dim)]/20"
                                      placeholder={'description'}
                                      {...register('description')}
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-[var(--error)]">{errors.description.message}</p>}
                                </div>

                                <div>
                                    <textarea
                                      className="min-h-[90px] w-full resize-y rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3 text-[var(--on-surface)] outline-none transition placeholder:text-[var(--on-surface-variant)]/60 focus:border-[var(--primary-fixed-dim)] focus:ring-2 focus:ring-[var(--primary-fixed-dim)]/20"
                                      placeholder={'additional details for AI description (optional)'}
                                      value={additionalDetails}
                                      onChange={(event) => setAdditionalDetails(event.target.value)}
                                    />
                                    <div className="mt-2 flex items-center justify-between gap-3">
                                        <p className="text-xs text-[var(--on-surface-variant)]">AI uses title, category, and these details.</p>
                                        <button
                                            type="button"
                                            onClick={handleGenerateDescription}
                                            disabled={isGeneratingDescription}
                                            className="rounded-lg border border-[var(--tertiary-container)]/40 bg-[var(--secondary-container)]/20 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--tertiary)] transition hover:bg-[var(--secondary-container)]/30 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isGeneratingDescription ? 'Generating...' : 'Generate Description'}
                                        </button>
                                    </div>
                                    {generateError ? (
                                        <p className="mt-1 text-sm text-[var(--error)]">{generateError.message}</p>
                                    ) : null}
                                </div>
                            </div>
                        </section>

                        <section
                            className="rounded-xl border border-[var(--outline-variant)] bg-[var(--background)] p-5"
                            onFocusCapture={() => setActiveStep(2)}
                        >
                            <h2 className="mb-4 font-['Hanken_Grotesk'] text-xl font-semibold text-[var(--on-surface)]">Schedule and Capacity</h2>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <input
                                        type="date"
                                        lang="en-GB"
                                        style={{ colorScheme: 'dark' }}
                                        min={isEditMode ? undefined : minimumEventDate}
                                        className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3 text-[var(--on-surface)] outline-none transition focus:border-[var(--primary-fixed-dim)] focus:ring-2 focus:ring-[var(--primary-fixed-dim)]/20"
                                        {...register('date')}
                                    />
                                    {errors.date && <p className="mt-1 text-sm text-[var(--error)]">{errors.date.message}</p>}
                                </div>

                                <div>
                                    <input
                                        type="time"
                                        style={{ colorScheme: 'dark' }}
                                        className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3 text-[var(--on-surface)] outline-none transition focus:border-[var(--primary-fixed-dim)] focus:ring-2 focus:ring-[var(--primary-fixed-dim)]/20"
                                        {...register('time')}
                                    />
                                    {errors.time && <p className="mt-1 text-sm text-[var(--error)]">{errors.time.message}</p>}
                                </div>

                                <div>
                                    <input
                                        type="date"
                                        lang="en-GB"
                                        style={{ colorScheme: 'dark' }}
                                        className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3 text-[var(--on-surface)] outline-none transition focus:border-[var(--primary-fixed-dim)] focus:ring-2 focus:ring-[var(--primary-fixed-dim)]/20"
                                        {...register('endDate')}
                                    />
                                    {errors.endDate && <p className="mt-1 text-sm text-[var(--error)]">{errors.endDate.message}</p>}
                                </div>

                                <div>
                                    <input
                                        type="time"
                                        style={{ colorScheme: 'dark' }}
                                        className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3 text-[var(--on-surface)] outline-none transition focus:border-[var(--primary-fixed-dim)] focus:ring-2 focus:ring-[var(--primary-fixed-dim)]/20"
                                        {...register('endTime')}
                                    />
                                    {errors.endTime && <p className="mt-1 text-sm text-[var(--error)]">{errors.endTime.message}</p>}
                                </div>

                                <div>
                                    <label htmlFor="event-building" className="mb-1 block text-sm font-medium text-[var(--on-surface)]">
                                        Building
                                    </label>
                                    <input
                                        id="event-building"
                                        list="event-building-options"
                                        required
                                        pattern={buildingPattern}
                                        className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3 text-[var(--on-surface)] outline-none transition placeholder:text-[var(--on-surface-variant)]/60 focus:border-[var(--primary-fixed-dim)] focus:ring-2 focus:ring-[var(--primary-fixed-dim)]/20"
                                        placeholder={'search building'}
                                        title="Please select one of the listed buildings"
                                        value={selectedBuilding}
                                        onChange={handleBuildingChange}
                                    />
                                    <datalist id="event-building-options">
                                        {universityBuildings.map((building) => (
                                            <option key={building} value={building} />
                                        ))}
                                    </datalist>
                                </div>

                                <div>
                                    <label htmlFor="event-room-hall" className="mb-1 block text-sm font-medium text-[var(--on-surface)]">
                                        Room / Hall (Optional)
                                    </label>
                                    <input
                                        id="event-room-hall"
                                        className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3 text-[var(--on-surface)] outline-none transition placeholder:text-[var(--on-surface-variant)]/60 focus:border-[var(--primary-fixed-dim)] focus:ring-2 focus:ring-[var(--primary-fixed-dim)]/20"
                                        placeholder={'Room 205, Lobby, Hall A'}
                                        value={roomHall}
                                        onChange={handleRoomHallChange}
                                    />
                                    <input type="hidden" {...register('location')} />
                                    {errors.location && <p className="mt-1 text-sm text-[var(--error)]">{errors.location.message}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <input
                                        type="number"
                                        min={1}
                                        className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3 text-[var(--on-surface)] outline-none transition placeholder:text-[var(--on-surface-variant)]/60 focus:border-[var(--primary-fixed-dim)] focus:ring-2 focus:ring-[var(--primary-fixed-dim)]/20"
                                        placeholder={'capacity'}
                                        {...register('capacity')}
                                    />
                                    {errors.capacity && <p className="mt-1 text-sm text-[var(--error)]">{errors.capacity.message}</p>}
                                </div>
                            </div>
                        </section>

                        <section
                            className="rounded-xl border border-[var(--outline-variant)] bg-[var(--background)] p-5"
                            onFocusCapture={() => setActiveStep(3)}
                        >
                            <div className="flex flex-col gap-4">
                                <button
                                    className="rounded-lg bg-[var(--primary-container)] px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-primary)] transition hover:bg-[var(--primary-fixed-dim)] disabled:cursor-wait disabled:opacity-70"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Event' : 'Create Event')}
                                </button>
                            </div>
                        </section>
                    </form>

                    {error && <p className="mt-4 text-sm text-[var(--error)]">{error.message}</p>}
                </div>
            </div>
        </div>
        </div>
    );
}

export default CreateEventPage;
