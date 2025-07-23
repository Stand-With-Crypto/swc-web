export const GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP = {
  ENG: 'England',
  NIR: 'Northern Ireland',
  SCT: 'Scotland',
  WLS: 'Wales',
} as const

// TODO: use this enum on normalizeGBAdministrativeArea
export enum GB_NUTS_1_AREA_NAMES {
  Wales = 'Wales',
  NorthernIreland = 'Northern Ireland',
  London = 'London',
  Scotland = 'Scotland',
  EastOfEngland = 'East of England',
  NorthEastEngland = 'North East England',
  SouthWestEngland = 'South West England',
  NorthWestEngland = 'North West England',
  EastMidlandsEngland = 'East Midlands England',
  SouthEastEngland = 'South East England',
  WestMidlandsEngland = 'West Midlands England',
  YorkshireAndTheHumber = 'Yorkshire and The Humber',
}

export type GBCountryCode = keyof typeof GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP

export const getGBCountryNameFromCode = (code: string) => {
  // @ts-ignore
  const name: string = GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP[code.toUpperCase()]
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
