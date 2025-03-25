export const UK_COUNTRY_CODE_TO_DISPLAY_NAME_MAP = {
  ENG: 'England',
  SCT: 'Scotland',
  WLS: 'Wales',
  NIR: 'Northern Ireland',
} as const

export type UKCountryCode = keyof typeof UK_COUNTRY_CODE_TO_DISPLAY_NAME_MAP

export const getUKCountryNameFromCountryCode = (countryCode: string) => {
  // @ts-ignore
  const name: string = UK_COUNTRY_CODE_TO_DISPLAY_NAME_MAP[countryCode.toUpperCase()]
  if (name) {
    return name
  }
  return countryCode
}

export const getUKCountryCodeFromCountryName = (countryName: string) => {
  const countryCode = Object.keys(UK_COUNTRY_CODE_TO_DISPLAY_NAME_MAP).find(
    key =>
      UK_COUNTRY_CODE_TO_DISPLAY_NAME_MAP[
        key as keyof typeof UK_COUNTRY_CODE_TO_DISPLAY_NAME_MAP
      ] === countryName,
  )
  return countryCode as UKCountryCode | undefined
}
