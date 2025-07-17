export const CA_MAIN_PROVINCES_CODE_TO_DISPLAY_NAME_MAP = {
  AB: 'Alberta',
  BC: 'British Columbia',
  MB: 'Manitoba',
  NB: 'New Brunswick',
  NL: 'Newfoundland and Labrador',
  NS: 'Nova Scotia',
  ON: 'Ontario',
  PE: 'Prince Edward Island',
  QC: 'Quebec',
  SK: 'Saskatchewan',
} as const

const CA_TERRITORY_CODE_TO_DISPLAY_NAME_MAP = {
  NT: 'Northwest Territories',
  NU: 'Nunavut',
  YT: 'Yukon',
} as const

export const CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP = {
  ...CA_MAIN_PROVINCES_CODE_TO_DISPLAY_NAME_MAP,
  ...CA_TERRITORY_CODE_TO_DISPLAY_NAME_MAP,
} as const

export type CAProvinceCode = keyof typeof CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP

export type CAProvinceOrTerritoryCode =
  keyof typeof CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP

export const getCAProvinceOrTerritoryNameFromCode = (code: string) => {
  // @ts-ignore
  const name: string = CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP[code.toUpperCase()]
  if (name) {
    return name
  }
  return code
}

export const getCAProvinceOrTerritoryCodeFromName = (provinceOrTerritoryName: string) => {
  const code = Object.keys(CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP).find(
    key =>
      CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP[
        key as keyof typeof CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP
      ] === provinceOrTerritoryName,
  )
  return code as CAProvinceOrTerritoryCode | undefined
}

export const isValidCAProvinceOrTerritoryCode = (code: string) =>
  code.toUpperCase() in CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP
