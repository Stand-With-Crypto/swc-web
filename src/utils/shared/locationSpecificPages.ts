import { USStateCode } from '@/utils/shared/usStateUtils'

// this will be manually modified as we go-live with additional state pages
export const US_LOCATION_PAGES_LIVE: Array<
  USStateCode | { stateCode: USStateCode; districts: number[] }
> = ['WY']
