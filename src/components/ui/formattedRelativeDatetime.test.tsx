/**
 * @jest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { render } from '@testing-library/react'

import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

import { FormattedRelativeDatetime } from './formattedRelativeDatetime'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/us'),
}))

describe('FormattedRelativeDatetime', () => {
  let mockDate: Date

  beforeEach(() => {
    // Mock current time to a fixed date for consistent tests
    mockDate = new Date('2024-01-01T12:00:00Z')
    jest.useFakeTimers()
    jest.setSystemTime(mockDate)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('just now scenarios', () => {
    it('should return "Just now" for dates less than 1 minute ago', () => {
      const date = new Date('2024-01-01T11:59:30Z') // 30 seconds ago
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.US} date={date} />,
      )
      expect(container.textContent).toBe('Just now')
    })

    it('should return "Just now" for current time', () => {
      const date = new Date('2024-01-01T12:00:00Z') // exactly now
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.US} date={date} />,
      )
      expect(container.textContent).toBe('Just now')
    })

    it('should return "Just now" for 59 seconds ago', () => {
      const date = new Date('2024-01-01T11:59:01Z') // 59 seconds ago
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.US} date={date} />,
      )
      expect(container.textContent).toBe('Just now')
    })
  })

  describe('minutes scenarios', () => {
    it('should format 1 minute ago correctly', () => {
      const date = new Date('2024-01-01T11:59:00Z') // 1 minute ago
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.US} date={date} />,
      )
      expect(container.textContent).toBe('1 min. ago')
    })

    it('should format 30 minutes ago correctly', () => {
      const date = new Date('2024-01-01T11:30:00Z') // 30 minutes ago
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.US} date={date} />,
      )
      expect(container.textContent).toBe('30 min. ago')
    })

    it('should format 59 minutes ago correctly', () => {
      const date = new Date('2024-01-01T11:01:00Z') // 59 minutes ago
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.US} date={date} />,
      )
      expect(container.textContent).toBe('59 min. ago')
    })
  })

  describe('hours scenarios', () => {
    it('should format 1 hour ago correctly', () => {
      const date = new Date('2024-01-01T11:00:00Z') // 1 hour ago
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.US} date={date} />,
      )
      expect(container.textContent).toBe('1 hr. ago')
    })

    it('should format 12 hours ago correctly', () => {
      const date = new Date('2024-01-01T00:00:00Z') // 12 hours ago
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.US} date={date} />,
      )
      expect(container.textContent).toBe('12 hr. ago')
    })

    it('should format 23 hours ago correctly', () => {
      const date = new Date('2023-12-31T13:00:00Z') // 23 hours ago
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.US} date={date} />,
      )
      expect(container.textContent).toBe('23 hr. ago')
    })
  })

  describe('days scenarios', () => {
    it('should format 1 day ago correctly', () => {
      const date = new Date('2023-12-31T12:00:00Z') // 1 day ago
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.US} date={date} />,
      )
      expect(container.textContent).toBe('1 day ago')
    })

    it('should format 7 days ago correctly', () => {
      const date = new Date('2023-12-25T12:00:00Z') // 7 days ago
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.US} date={date} />,
      )
      expect(container.textContent).toBe('7 days ago')
    })

    it('should format 30 days ago correctly', () => {
      const date = new Date('2023-12-02T12:00:00Z') // 30 days ago
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.US} date={date} />,
      )
      expect(container.textContent).toBe('30 days ago')
    })
  })

  describe('different country codes', () => {
    it('should work with GB country code', () => {
      const date = new Date('2024-01-01T11:30:00Z') // 30 minutes ago
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.GB} date={date} />,
      )
      expect(container.textContent).toBe('30 min. ago')
    })

    it('should work with CA country code', () => {
      const date = new Date('2024-01-01T10:00:00Z') // 2 hours ago
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.CA} date={date} />,
      )
      expect(container.textContent).toBe('2 hr. ago')
    })

    it('should work with AU country code', () => {
      const date = new Date('2023-12-31T12:00:00Z') // 1 day ago
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.AU} date={date} />,
      )
      expect(container.textContent).toBe('1 day ago')
    })
  })

  describe('timeFormatStyle variations', () => {
    it('should use long format style', () => {
      const date = new Date('2024-01-01T11:30:00Z') // 30 minutes ago
      const { container } = render(
        <FormattedRelativeDatetime
          countryCode={SupportedCountryCodes.US}
          date={date}
          timeFormatStyle="long"
        />,
      )
      expect(container.textContent).toBe('30 minutes ago')
    })

    it('should use narrow format style', () => {
      const date = new Date('2024-01-01T11:30:00Z') // 30 minutes ago
      const { container } = render(
        <FormattedRelativeDatetime
          countryCode={SupportedCountryCodes.US}
          date={date}
          timeFormatStyle="narrow"
        />,
      )
      expect(container.textContent).toBe('30m ago')
    })

    it('should default to short format style', () => {
      const date = new Date('2024-01-01T11:30:00Z') // 30 minutes ago
      // timeFormatStyle not provided, should default to 'short'
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.US} date={date} />,
      )
      expect(container.textContent).toBe('30 min. ago')
    })
  })

  describe('edge cases and boundary conditions', () => {
    it('should handle exactly 60 minutes (should be 1 hour)', () => {
      const date = new Date('2024-01-01T11:00:00Z') // exactly 60 minutes ago
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.US} date={date} />,
      )
      expect(container.textContent).toBe('1 hr. ago')
    })

    it('should handle exactly 24 hours (should be 1 day)', () => {
      const date = new Date('2023-12-31T12:00:00Z') // exactly 24 hours ago
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.US} date={date} />,
      )
      expect(container.textContent).toBe('1 day ago')
    })

    it('should handle future dates (negative minutes)', () => {
      const date = new Date('2024-01-01T12:30:00Z') // 30 minutes in the future
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.US} date={date} />,
      )
      // Future dates are treated as "Just now" because minutesAgo will be negative
      expect(container.textContent).toBe('Just now')
    })

    it('should handle date objects with milliseconds', () => {
      const date = new Date('2024-01-01T11:59:00.500Z') // 1 minute ago with milliseconds
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.US} date={date} />,
      )
      // differenceInMinutes rounds down, so this is still less than 1 minute
      expect(container.textContent).toBe('Just now')
    })
  })

  describe('mathematical precision', () => {
    it('should floor hours correctly', () => {
      const date = new Date('2024-01-01T10:30:00Z') // 1.5 hours ago (90 minutes)
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.US} date={date} />,
      )
      // Math.floor((-1 * 90) / 60) = Math.floor(-1.5) = -2, so it shows 2 hours
      expect(container.textContent).toBe('2 hr. ago')
    })

    it('should floor days correctly', () => {
      const date = new Date('2023-12-30T18:00:00Z') // 1.75 days ago (about 42 hours)
      const { container } = render(
        <FormattedRelativeDatetime countryCode={SupportedCountryCodes.US} date={date} />,
      )
      // Math.floor((-1 * ~2520) / 1440) = Math.floor(-1.75) = -2, so it shows 2 days
      expect(container.textContent).toBe('2 days ago')
    })
  })
})
