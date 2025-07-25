const manuallyNormalizedAustraliaDistrictsOverrides: Record<string, string> = {
  Mcewen: 'McEwen',
  'Eden-monaro': 'Eden-Monaro',
  Mcmahon: 'McMahon',
  [`O'connor`]: `O'Connor`,
}

export function normalizeAUDistrictName(name?: string) {
  if (!name) {
    return
  }

  if (manuallyNormalizedAustraliaDistrictsOverrides[name]) {
    return manuallyNormalizedAustraliaDistrictsOverrides[name]
  }

  return name
}
