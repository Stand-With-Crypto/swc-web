'use client'

/**
 * Odometer animations are smoothest when we aren't going from a higher number to a lower number
 * so to create the desired initial loading effect, we want the animating numbers to always start at zero
 * To prevent not animating because the actual number is zero, we subtract one from the actual number
 */
export function roundDownNumberToAnimateIn(value: number, roundTo: number) {
  return Math.floor((value - 1) / roundTo) * roundTo
}

/**
 * Rounds down a number to the nearest multiple of the granularity
 */
export function roundDownNumberByGranularityToAnimateIn(value: number, granularity: number) {
  if (granularity <= 0) {
    throw new Error('Granularity must be a positive number')
  }

  return Math.floor(value / granularity) * granularity
}
