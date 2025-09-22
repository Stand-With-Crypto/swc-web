import { describe, expect, it } from '@jest/globals'

import { EVENT_TYPE_OPTIONS, SWCEvents } from '@/utils/shared/zod/getSWCEvents'

import { getFutureEvents } from './getFutureEvents'

describe('getFutureEvents', () => {
  const mockPastEvent: SWCEvents[0] = {
    data: {
      promotedPositioning: 1,
      image: 'https://example.com/image.jpg',
      rsvpUrl: 'https://example.com/rsvp',
      formattedAddress: '123 Main St, City, State',
      countryCode: 'US',
      isOccuring: false,
      name: 'Past Event',
      state: 'CA',
      type: EVENT_TYPE_OPTIONS.official,
      isFeatured: true,
      slug: 'past-event',
      city: 'San Francisco',
      date: '2023-01-01',
      time: '10:00',
      formattedDescription: 'A past event',
    },
  }

  const mockFutureEvent: SWCEvents[0] = {
    data: {
      ...mockPastEvent.data,
      name: 'Future Event',
      date: '2030-12-31',
      slug: 'future-event',
    },
  }

  it('should return future events', () => {
    const events: SWCEvents = [mockPastEvent, mockFutureEvent]
    const result = getFutureEvents(events)

    expect(result).toHaveLength(1)
    expect(result?.[0]?.data.name).toBe('Future Event')
  })

  it('should return empty array when no future events', () => {
    const events: SWCEvents = [mockPastEvent]
    const result = getFutureEvents(events)

    expect(result).toHaveLength(0)
  })

  it('should handle null/undefined events', () => {
    expect(getFutureEvents(null)).toBeUndefined()
    expect(getFutureEvents(undefined)).toBeUndefined()
  })

  it('should include events from today (within 1 day buffer)', () => {
    const today = new Date()

    const todayEvent: SWCEvents[0] = {
      data: {
        ...mockPastEvent.data,
        name: 'Today Event',
        date: today.toISOString().split('T')[0],
        slug: 'today-event',
      },
    }

    const events: SWCEvents = [todayEvent]
    const result = getFutureEvents(events)

    expect(result).toHaveLength(1)
    expect(result?.[0]?.data.name).toBe('Today Event')
  })

  it('should exclude events from yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const yesterdayEvent: SWCEvents[0] = {
      data: {
        ...mockPastEvent.data,
        name: 'Yesterday Event',
        date: yesterday.toISOString().split('T')[0],
        slug: 'yesterday-event',
      },
    }

    const events: SWCEvents = [yesterdayEvent]
    const result = getFutureEvents(events)

    expect(result).toHaveLength(0)
  })
})
