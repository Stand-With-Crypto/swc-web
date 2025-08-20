import { GB_NUTS_1_AREA_NAMES } from '@/utils/shared/stateMappings/gbCountryUtils'

export function normalizeGBAdministrativeArea(
  administrativeArea?: string,
): GB_NUTS_1_AREA_NAMES | undefined {
  if (!administrativeArea) {
    return
  }

  let normalizedAdministrativeArea = administrativeArea

  normalizedAdministrativeArea = normalizedAdministrativeArea.replace('(England)', 'England')

  if (!(normalizedAdministrativeArea in GB_NUTS_1_AREA_NAMES)) {
    console.error(
      `Unknown GB administrative area: ${normalizedAdministrativeArea}. Please add it to the GB_NUTS_1_AREA_NAMES enum.`,
    )
    return
  }

  return normalizedAdministrativeArea as GB_NUTS_1_AREA_NAMES
}
