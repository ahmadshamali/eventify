import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

import EventCardShell from '../../shared/components/events/EventCardShell'
import EventEmptyState from '../../shared/components/events/EventEmptyState'
import EventErrorState from '../../shared/components/events/EventErrorState'
import EventLoadingState from '../../shared/components/events/EventLoadingState'
import EventPageBackdrop from '../../shared/components/events/EventPageBackdrop'
import EventPrimaryLinkButton from '../../shared/components/events/EventPrimaryLinkButton'
import EventStatusBadge from '../../shared/components/events/EventStatusBadge'

import { fetchEvents } from './eventApi'
import type { Event } from './event.types'
import { formatEventStartTime, getEventLifecycleStatus } from './eventTime'

const categoryOptions = ['All Categories', 'Technology', 'Business & Entrepreneurship', 'Education & Workshops', 'Sports & Fitness', 'Arts & Culture'] as const
const availabilityOptions = ['All Events', 'Available', 'Full'] as const
const timeRangeOptions = ['All Events', 'This Week', 'This Month'] as const
type TimeRange = (typeof timeRangeOptions)[number]

const isEventInTimeRange = (eventDateTime: string, range: TimeRange) => {
  if (range === 'All Events') {
    return true
  }

  const eventDate = new Date(eventDateTime)
  const now = new Date()

  if (range === 'This Week') {
    const startOfWeek = new Date(now)
    startOfWeek.setHours(0, 0, 0, 0)
    const dayOffset = (startOfWeek.getDay() + 6) % 7
    startOfWeek.setDate(startOfWeek.getDate() - dayOffset)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    return eventDate >= startOfWeek && eventDate < endOfWeek
  }

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  return eventDate >= startOfMonth && eventDate < startOfNextMonth
}

function EventsPage() {
  const { role } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchTerm = searchParams.get('search')?.trim().toLowerCase() ?? ''
  const selectedCategory = searchParams.get('category') ?? 'All Categories'
  const selectedAvailability = searchParams.get('availability') ?? 'All Events'
  const selectedTimeRange = (timeRangeOptions.includes(searchParams.get('range') as TimeRange) ? searchParams.get('range') : 'All Events') as TimeRange

  const { data: events = [], isLoading: loading, error } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: () => fetchEvents(),
  })

  const visibleEvents = useMemo(() => {
    const upcomingEvents = events.filter((event) => getEventLifecycleStatus(event) !== 'Completed')

    return upcomingEvents.filter((event) => {
      const startDate = new Date(event.startDateTime)
      const searchableText = [
        event.title,
        event.category,
        startDate.toLocaleDateString(),
        startDate.toISOString().slice(0, 10),
      ]
        .join(' ')
        .toLowerCase()

      const matchesSearch = !searchTerm || searchableText.includes(searchTerm)
      const matchesCategory = selectedCategory === 'All Categories' || event.category === selectedCategory
      const matchesAvailability = selectedAvailability === 'All Events' || event.status === selectedAvailability
      const matchesTimeRange = isEventInTimeRange(event.startDateTime, selectedTimeRange)

      return matchesSearch && matchesCategory && matchesAvailability && matchesTimeRange
    })
  }, [events, searchTerm, selectedAvailability, selectedCategory, selectedTimeRange])

  const updateSearchParams = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams)

    if (value) {
      nextParams.set(key, value)
    } else {
      nextParams.delete(key)
    }

    setSearchParams(nextParams, { replace: true })
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 md:px-8">
      <EventPageBackdrop />

      <div className="mx-auto w-full max-w-[1280px]">
        <header className="mb-8 flex flex-col justify-between gap-4 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] p-6 shadow-sm md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--primary)]">Eventify Catalog</p>
            <h1 className="mt-2 font-['Hanken_Grotesk'] text-4xl font-semibold tracking-tight text-[var(--on-surface)]">
              Events
            </h1>
            <p className="mt-2 text-[var(--on-surface-variant)]">Discover and manage upcoming university events.</p>
          </div>
          {(role === 'organizer' || role === 'admin') ? (
            <Link
              to="/events/create"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary-container)] px-5 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-primary)] transition hover:bg-[var(--primary-fixed-dim)]"
            >
              <span className="material-symbols-outlined text-lg" aria-hidden="true">add</span>
              New Event
            </Link>
          ) : null}
        </header>

        <div className="mb-6 flex flex-wrap gap-3">
          {timeRangeOptions.map((range) => {
            const isActive = selectedTimeRange === range

            return (
              <button
                key={range}
                type="button"
                onClick={() => updateSearchParams('range', range === 'All Events' ? '' : range)}
                className={[
                  'rounded-full border px-5 py-3 text-sm font-semibold transition',
                  isActive
                    ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
                    : 'border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] text-[var(--on-surface)] hover:border-[var(--primary-fixed-dim)] hover:text-[var(--primary)]',
                ].join(' ')}
                aria-pressed={isActive}
              >
                {range}
              </button>
            )
          })}
        </div>

        <div className="mb-6 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)] p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--on-surface)]">Category</span>
              <select
                value={selectedCategory}
                onChange={(event) => updateSearchParams('category', event.target.value === 'All Categories' ? '' : event.target.value)}
                className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--on-surface)] outline-none transition focus:border-[var(--primary-fixed-dim)] focus:ring-2 focus:ring-[var(--primary-fixed-dim)]/20"
                aria-label="Filter by category"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--on-surface)]">Availability</span>
              <select
                value={selectedAvailability}
                onChange={(event) => updateSearchParams('availability', event.target.value === 'All Events' ? '' : event.target.value)}
                className="w-full rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--on-surface)] outline-none transition focus:border-[var(--primary-fixed-dim)] focus:ring-2 focus:ring-[var(--primary-fixed-dim)]/20"
                aria-label="Filter by availability"
              >
                {availabilityOptions.map((availability) => (
                  <option key={availability} value={availability}>
                    {availability}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {error && (
          <EventErrorState>
            <p>{error instanceof Error ? error.message : 'An error occurred'}</p>
          </EventErrorState>
        )}

        {loading ? (
          <EventLoadingState className="h-[200px]" message="Loading events..." />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleEvents.length === 0 && !error ? (
              <EventEmptyState
                className="col-span-full"
                title={searchTerm ? 'No matching events' : 'No events found'}
                description={searchTerm ? 'Try a different title, category, or date.' : 'The backend database is empty or not seeded yet.'}
              />
            ) : (
              visibleEvents.map((event) => (
                <EventCardShell key={event.id}>
                  {event.imageUrl ? (
                    <div className="mb-5 overflow-hidden rounded-lg border border-[var(--outline-variant)] bg-[var(--surface-container-lowest)]">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                  ) : null}
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <h3 className="font-['Hanken_Grotesk'] text-2xl font-semibold text-[var(--on-surface)]">{event.title}</h3>
                    <div className="flex flex-col items-end gap-2">
                      <EventStatusBadge tone={event.status === 'Full' ? 'full' : 'available'}>
                        {event.status === 'Full' ? 'Full' : 'Available'}
                      </EventStatusBadge>
                    </div>
                  </div>
                  <p className="grow text-sm leading-6 text-[var(--on-surface-variant)]">
                    {event.description || 'No description provided.'}
                  </p>
                  <div className="mt-8 border-t border-[var(--outline-variant)] pt-6">
                    <div className="flex flex-col gap-1 text-sm text-[var(--on-surface-variant)]">
                      <span>Starts: {formatEventStartTime(event.startDateTime)}</span>
                      <span>Location: {event.location}</span>
                      <span>
                        Capacity: {event.registered_count}/{event.capacity}
                      </span>
                    </div>

                    <div className="mt-4 flex items-end justify-end gap-3 pr-1 pb-1">
                      {event.eventLink ? (
                        <a
                          href={event.eventLink}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-[var(--outline-variant)] px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--on-surface)] transition hover:bg-[var(--surface-container-high)] hover:text-[var(--primary)]"
                        >
                          Link
                        </a>
                      ) : null}
                      <EventPrimaryLinkButton to={`/events/${event.id}/details`}>Details</EventPrimaryLinkButton>
                    </div>
                  </div>
                </EventCardShell>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default EventsPage;
