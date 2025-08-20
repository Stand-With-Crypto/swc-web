import { GB_NUTS_1_AREA_NAMES, GBRegion } from '@/utils/shared/stateMappings/gbCountryUtils'

export function normalizeGBAdministrativeArea(administrativeArea?: string): GBRegion | undefined {
  if (!administrativeArea) {
    return
  }

  let normalizedAdministrativeArea = administrativeArea

  normalizedAdministrativeArea = normalizedAdministrativeArea.replace('(England)', 'England')

  if (!GB_NUTS_1_AREA_NAMES.includes(normalizedAdministrativeArea)) {
    console.error(
      `Unknown GB administrative area: ${normalizedAdministrativeArea}. Please add it to the GB_NUTS_1_AREA_NAMES array.`,
    )
    return
  }

  return normalizedAdministrativeArea as GBRegion
}
