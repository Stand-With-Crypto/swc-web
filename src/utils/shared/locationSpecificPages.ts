import { USStateCode } from '@/utils/shared/usStateUtils'

// this will be manually modified as we go-live with additional state pages
export const US_LOCATION_PAGES_LIVE: Array<
  USStateCode | { stateCode: USStateCode; districts: number[] }
> = ['WY']

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
