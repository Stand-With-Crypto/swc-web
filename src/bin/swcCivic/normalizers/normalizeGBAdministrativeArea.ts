export function normalizeGBAdministrativeArea(administrativeArea?: string) {
  if (!administrativeArea) {
    return
  }

  let normalizedAdministrativeArea = administrativeArea

  normalizedAdministrativeArea = normalizedAdministrativeArea.replace('(England)', 'England')

  return normalizedAdministrativeArea
}
