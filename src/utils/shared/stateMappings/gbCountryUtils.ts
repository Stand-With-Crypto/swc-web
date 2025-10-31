export const GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP = {
  ENG: 'England',
  NIR: 'Northern Ireland',
  SCT: 'Scotland',
  WLS: 'Wales',
} as const

export const GB_NUTS_1_AREA_NAMES = [
  'Wales',
  'Northern Ireland',
  'London',
  'Scotland',
  'East of England',
  'North East England',
  'South West England',
  'North West England',
  'East Midlands England',
  'South East England',
  'West Midlands England',
  'Yorkshire and The Humber',
] as const

export type GBRegion = (typeof GB_NUTS_1_AREA_NAMES)[number]

export type GBCountryCode = keyof typeof GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP

export const getGBCountryNameFromCode = (code: string) => {
  const upperCode = code.toUpperCase() as keyof typeof GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP
  const name: string = GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP[upperCode]
  if (name) {
    return name
  }
  return code
}

export const getGBCountryCodeFromName = (name: string) => {
  const code = Object.keys(GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP).find(
    key =>
      GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP[
        key as keyof typeof GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP
      ] === name,
  )
  return code as GBCountryCode | undefined
}

export const isValidGBCountryCode = (code: string) =>
  code.toUpperCase() in GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP
