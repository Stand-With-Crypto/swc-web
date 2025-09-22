import { describe, expect, it } from '@jest/globals'

import { EVENT_TYPE_OPTIONS, SWCEvents } from '@/utils/shared/zod/getSWCEvents'

import { getPromotedEvents } from './getPromotedEvents'

describe('getPromotedEvents', () => {
  const mockEvent: SWCEvents[0] = {
    data: {
      promotedPositioning: 2,
      image: 'https://example.com/image.jpg',
      rsvpUrl: 'https://example.com/rsvp',
      formattedAddress: '123 Main St, City, State',
      countryCode: 'US',
      isOccuring: false,
      name: 'Event 1',
      state: 'CA',
      type: EVENT_TYPE_OPTIONS.official,
      isFeatured: true,
      slug: 'event-1',
      city: 'San Francisco',
      date: '2024-12-31',
      time: '10:00',
      formattedDescription: 'An event',
    },
  }

  const mockPromotedEvent1: SWCEvents[0] = {
    data: {
      ...mockEvent.data,
      name: 'Promoted Event 1',
      promotedPositioning: 1,
      slug: 'promoted-event-1',
    },
  }

  const mockPromotedEvent2: SWCEvents[0] = {
    data: {
      ...mockEvent.data,
      name: 'Promoted Event 2',
      promotedPositioning: 3,
      slug: 'promoted-event-2',
    },
  }

  const mockNonPromotedEvent: SWCEvents[0] = {
    data: {
      ...mockEvent.data,
      name: 'Non-Promoted Event',
      promotedPositioning: undefined,
      slug: 'non-promoted-event',
    },
  }

  it('should return only promoted events', () => {
    const events: SWCEvents = [mockPromotedEvent1, mockNonPromotedEvent, mockPromotedEvent2]
    const result = getPromotedEvents(events)

    expect(result).toHaveLength(2)
    expect(result?.map(e => e.data.name)).toEqual(['Promoted Event 1', 'Promoted Event 2'])
  })

  it('should sort promoted events by positioning', () => {
    const events: SWCEvents = [mockPromotedEvent2, mockPromotedEvent1]
    const result = getPromotedEvents(events)

    expect(result).toHaveLength(2)
    expect(result?.[0]?.data.promotedPositioning).toBe(1)
    expect(result?.[1]?.data.promotedPositioning).toBe(3)
  })

  it('should return empty array when no promoted events', () => {
    const events: SWCEvents = [mockNonPromotedEvent]
    const result = getPromotedEvents(events)

    expect(result).toHaveLength(0)
  })

  it('should handle null/undefined events', () => {
    expect(getPromotedEvents(null)).toBeUndefined()
    expect(getPromotedEvents(undefined)).toBeUndefined()
  })

  it('should handle empty events array', () => {
    const result = getPromotedEvents([])

    expect(result).toHaveLength(0)
  })
})
