import { describe, expect, it } from '@jest/globals'

import { EVENT_TYPE_OPTIONS, SWCEvents } from '@/utils/shared/zod/getSWCEvents'

import { getFeaturedPastEvents } from './getFeaturedPastEvents'

describe('getFeaturedPastEvents', () => {
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

  it('should return past events', () => {
    const events: SWCEvents = [mockPastEvent, mockFutureEvent]
    const result = getFeaturedPastEvents(events)

    expect(result).toHaveLength(1)
    expect(result?.[0]?.data.name).toBe('Past Event')
  })

  it('should return empty array when no past events', () => {
    const events: SWCEvents = [mockFutureEvent]
    const result = getFeaturedPastEvents(events)

    expect(result).toHaveLength(0)
  })

  it('should handle null/undefined events', () => {
    expect(getFeaturedPastEvents(null)).toBeUndefined()
    expect(getFeaturedPastEvents(undefined)).toBeUndefined()
  })

  it('should handle events without time', () => {
    const eventWithoutTime: SWCEvents[0] = {
      data: {
        ...mockPastEvent.data,
        time: undefined,
      },
    }
    const events: SWCEvents = [eventWithoutTime]
    const result = getFeaturedPastEvents(events)

    expect(result).toHaveLength(1)
  })
})
