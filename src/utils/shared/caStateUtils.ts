export const CANADA_MAIN_PROVINCE_CODE_TO_DISPLAY_NAME_MAP = {
  AB: 'Alberta',
  BC: 'British Columbia',
  MB: 'Manitoba',
  NB: 'New Brunswick',
  NL: 'Newfoundland and Labrador',
  NT: 'Northwest Territories',
  NS: 'Nova Scotia',
  ON: 'Ontario',
  PE: 'Prince Edward Island',
  QC: 'Quebec',
  SK: 'Saskatchewan',
} as const

const CANADA_TERRITORY_CODE_TO_DISPLAY_NAME_MAP = {
  NU: 'Nunavut',
  YT: 'Yukon',
}

export const CANADA_STATE_CODE_TO_DISPLAY_NAME_MAP = {
  ...CANADA_MAIN_PROVINCE_CODE_TO_DISPLAY_NAME_MAP,
  ...CANADA_TERRITORY_CODE_TO_DISPLAY_NAME_MAP,
} as const

export type CanadaStateCode = keyof typeof CANADA_STATE_CODE_TO_DISPLAY_NAME_MAP

export const getCanadaStateNameFromStateCode = (stateCode: string) => {
  // @ts-ignore
  const name: string = CANADA_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode.toUpperCase()]
  if (name) {
    return name
  }
  return stateCode
}

export const getCanadaStateCodeFromStateName = (stateName: string) => {
  const stateCode = Object.keys(CANADA_STATE_CODE_TO_DISPLAY_NAME_MAP).find(
    key =>
      CANADA_STATE_CODE_TO_DISPLAY_NAME_MAP[
        key as keyof typeof CANADA_STATE_CODE_TO_DISPLAY_NAME_MAP
      ] === stateName,
  )
  return stateCode as CanadaStateCode | undefined
}
