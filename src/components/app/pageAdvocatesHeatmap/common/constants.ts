import {
  AU_ADVOCATES_ACTIONS,
  AU_STATE_COORDS,
} from '@/components/app/pageAdvocatesHeatmap/au/constants'
import {
  CA_ADVOCATES_ACTIONS,
  CA_STATE_COORDS,
} from '@/components/app/pageAdvocatesHeatmap/ca/constants'
import { ActionListItem } from '@/components/app/pageAdvocatesHeatmap/common/advocateHeatmapActionList'
import {
  GB_ADVOCATES_ACTIONS,
  GB_STATE_COORDS,
} from '@/components/app/pageAdvocatesHeatmap/gb/constants'
import {
  US_ADVOCATES_ACTIONS,
  US_STATE_COORDS,
} from '@/components/app/pageAdvocatesHeatmap/us/constants'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const getCoordinates = (countryCode: string) => {
  const COORDINATES_BY_COUNTRY_CODE: Record<
    SupportedCountryCodes,
    Record<string, [number, number]>
  > = {
    au: AU_STATE_COORDS,
    us: US_STATE_COORDS,
    ca: CA_STATE_COORDS,
    gb: GB_STATE_COORDS,
  }

  return COORDINATES_BY_COUNTRY_CODE[countryCode as keyof typeof COORDINATES_BY_COUNTRY_CODE]
}

export const getMapActions = (countryCode: string) => {
  const ACTIONS_BY_COUNTRY_CODE: Record<SupportedCountryCodes, ActionListItem> = {
    au: AU_ADVOCATES_ACTIONS,
    us: US_ADVOCATES_ACTIONS,
    ca: CA_ADVOCATES_ACTIONS,
    gb: GB_ADVOCATES_ACTIONS,
  }

  return ACTIONS_BY_COUNTRY_CODE[countryCode as keyof typeof ACTIONS_BY_COUNTRY_CODE]
}
