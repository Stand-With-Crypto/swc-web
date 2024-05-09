import { USStateCode } from '@/utils/shared/usStateUtils'

export const US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP: Partial<Record<USStateCode, number[]>> = {
  AL: [2],
  CA: [3, 9, 13, 22, 27, 41, 40, 47],
  MD: [6],
  OH: [9, 13],
  MI: [7, 8],
  NY: [3, 4, 17, 18, 19, 22],
  PA: [1, 7, 8, 10],
  TX: [15, 28, 32, 34],
  IN: [1],
  CO: [3, 8],
  VA: [7],
  SC: [1],
  AZ: [1, 6],
}

export const ENDORSED_DTSI_PERSON_SLUGS = [
  'shomari--figures',
  'troy---downing',
  'jim---banks',
  'jim--justice',
  'eduardo---morales',
  'angela---alsobrooks',
]

export const ORDERED_KEY_SENATE_RACE_STATES: USStateCode[] = [
  'OH',
  'MT',
  'PA',
  'AZ',
  'NV',
  'MA',
  'MI',
  'WI',
]
