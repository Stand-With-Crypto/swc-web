import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'

import { formatTimeAgo } from './formatTimeAgo'

describe('formatTimeAgo', () => {
  let originalDate: DateConstructor
  const mockNow = new Date('2024-01-15T10:30:00Z')

  beforeEach(() => {
    // Mock Date.now() to return a fixed time for consistent testing
    originalDate = global.Date
    global.Date = class extends originalDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(mockNow.getTime())
        } else {
          super(...(args as []))
        }
      }

      static now() {
        return mockNow.getTime()
      }
    } as DateConstructor
  })

  afterEach(() => {
    // Restore original Date
    global.Date = originalDate
  })

  it('should return "just now" for times less than 1 minute ago', () => {
    // 30 seconds ago
    const thirtySecondsAgo = new Date(mockNow.getTime() - 30 * 1000).toISOString()
    expect(formatTimeAgo(thirtySecondsAgo)).toBe('just now')

    // 0 seconds ago (same time)
    const sameTime = mockNow.toISOString()
    expect(formatTimeAgo(sameTime)).toBe('just now')

    // 59 seconds ago
    const fiftyNineSecondsAgo = new Date(mockNow.getTime() - 59 * 1000).toISOString()
    expect(formatTimeAgo(fiftyNineSecondsAgo)).toBe('just now')
  })

  it('should return minutes for times between 1-59 minutes ago', () => {
    // 1 minute ago
    const oneMinuteAgo = new Date(mockNow.getTime() - 1 * 60 * 1000).toISOString()
    expect(formatTimeAgo(oneMinuteAgo)).toBe('1m ago')
    // 2 minutes ago
    const twoMinutesAgo = new Date(mockNow.getTime() - 2 * 60 * 1000).toISOString()
    expect(formatTimeAgo(twoMinutesAgo)).toBe('2m ago')

    // 15 minutes ago
    const fifteenMinutesAgo = new Date(mockNow.getTime() - 15 * 60 * 1000).toISOString()
    expect(formatTimeAgo(fifteenMinutesAgo)).toBe('15m ago')

    // 59 minutes ago
    const fiftyNineMinutesAgo = new Date(mockNow.getTime() - 59 * 60 * 1000).toISOString()
    expect(formatTimeAgo(fiftyNineMinutesAgo)).toBe('59m ago')
  })

  it('should return hours for times between 1-23 hours ago', () => {
    // 1 hour ago
    const oneHourAgo = new Date(mockNow.getTime() - 1 * 60 * 60 * 1000).toISOString()
    expect(formatTimeAgo(oneHourAgo)).toBe('1h ago')
    // 2 hours ago
    const twoHoursAgo = new Date(mockNow.getTime() - 2 * 60 * 60 * 1000).toISOString()
    expect(formatTimeAgo(twoHoursAgo)).toBe('2h ago')

    // 12 hours ago
    const twelveHoursAgo = new Date(mockNow.getTime() - 12 * 60 * 60 * 1000).toISOString()
    expect(formatTimeAgo(twelveHoursAgo)).toBe('12h ago')

    // 23 hours ago
    const twentyThreeHoursAgo = new Date(mockNow.getTime() - 23 * 60 * 60 * 1000).toISOString()
    expect(formatTimeAgo(twentyThreeHoursAgo)).toBe('23h ago')
  })

  it('should return days for times 1+ days ago', () => {
    // 1 day ago
    const oneDayAgo = new Date(mockNow.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatTimeAgo(oneDayAgo)).toBe('1d ago')
    // 2 days ago
    const twoDaysAgo = new Date(mockNow.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatTimeAgo(twoDaysAgo)).toBe('2d ago')

    // 7 days ago
    const sevenDaysAgo = new Date(mockNow.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatTimeAgo(sevenDaysAgo)).toBe('7d ago')

    // 30 days ago
    const thirtyDaysAgo = new Date(mockNow.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatTimeAgo(thirtyDaysAgo)).toBe('30d ago')

    // 365 days ago
    const oneYearAgo = new Date(mockNow.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatTimeAgo(oneYearAgo)).toBe('365d ago')
  })

  it('should handle edge cases around time boundaries', () => {
    // 59.9 seconds ago (should round down to 0 minutes)
    const almostOneMinute = new Date(mockNow.getTime() - 59.9 * 1000).toISOString()
    expect(formatTimeAgo(almostOneMinute)).toBe('just now')

    // 60 seconds ago (should be 1 minute)
    const exactlyOneMinute = new Date(mockNow.getTime() - 60 * 1000).toISOString()
    expect(formatTimeAgo(exactlyOneMinute)).toBe('1m ago')

    // 3599 seconds ago (should be 59 minutes)
    const almostOneHour = new Date(mockNow.getTime() - 3599 * 1000).toISOString()
    expect(formatTimeAgo(almostOneHour)).toBe('59m ago')

    // 3600 seconds ago (should be 1 hour)
    const exactlyOneHour = new Date(mockNow.getTime() - 3600 * 1000).toISOString()
    expect(formatTimeAgo(exactlyOneHour)).toBe('1h ago')
  })

  it('should handle various ISO date string formats', () => {
    // With milliseconds
    const withMilliseconds = new Date(mockNow.getTime() - 5 * 60 * 1000).toISOString()
    expect(formatTimeAgo(withMilliseconds)).toBe('5m ago')

    // Different timezone format
    const withTimezone = new Date(mockNow.getTime() - 10 * 60 * 1000)
      .toISOString()
      .replace('Z', '+00:00')
    expect(formatTimeAgo(withTimezone)).toBe('10m ago')
  })

  it('should handle future dates gracefully', () => {
    // Future dates should return negative differences
    const futureTime = new Date(mockNow.getTime() + 5 * 60 * 1000).toISOString()
    // This would result in negative minutes, but the function should handle it
    // The current implementation would return "just now" for negative values < 1
    expect(formatTimeAgo(futureTime)).toBe('just now')
  })

  it('should handle invalid date strings gracefully', () => {
    // Invalid date string should result in NaN calculations
    expect(() => formatTimeAgo('invalid-date')).not.toThrow()

    // The function should return some value even with invalid input
    const result = formatTimeAgo('invalid-date')
    expect(typeof result).toBe('string')
  })

  it('should be consistent with real-world scenarios', () => {
    // Simulate realistic petition signing scenarios
    const scenarios = [
      { timeAgo: 0.5 * 60 * 1000, expected: 'just now' }, // 30 seconds
      { timeAgo: 2 * 60 * 1000, expected: '2m ago' }, // 2 minutes
      { timeAgo: 45 * 60 * 1000, expected: '45m ago' }, // 45 minutes
      { timeAgo: 3 * 60 * 60 * 1000, expected: '3h ago' }, // 3 hours
      { timeAgo: 2 * 24 * 60 * 60 * 1000, expected: '2d ago' }, // 2 days
    ]

    scenarios.forEach(({ timeAgo, expected }) => {
      const signedTime = new Date(mockNow.getTime() - timeAgo).toISOString()
      expect(formatTimeAgo(signedTime)).toBe(expected)
    })
  })
})
