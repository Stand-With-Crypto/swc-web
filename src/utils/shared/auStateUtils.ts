export const AU_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP = {
  NSW: 'New South Wales',
  VIC: 'Victoria',
  QLD: 'Queensland',
  WA: 'Western Australia',
  SA: 'South Australia',
  TAS: 'Tasmania',
} as const

const AU_TERRITORY_STATE_CODE_TO_DISPLAY_NAME_MAP = {
  ACT: 'Australian Capital Territory',
  NT: 'Northern Territory',
} as const

export const AU_STATE_CODE_TO_DISPLAY_NAME_MAP = {
  ...AU_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP,
  ...AU_TERRITORY_STATE_CODE_TO_DISPLAY_NAME_MAP,
} as const

export type AUStateCode = keyof typeof AU_STATE_CODE_TO_DISPLAY_NAME_MAP

export const getAUStateNameFromStateCode = (stateCode: string) => {
  // @ts-ignore
  const name: string = AU_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode.toUpperCase()]
  if (name) {
    return name
  }
  return stateCode
}

export const getAUStateCodeFromStateName = (stateName: string) => {
  const stateCode = Object.keys(AU_STATE_CODE_TO_DISPLAY_NAME_MAP).find(
    key =>
      AU_STATE_CODE_TO_DISPLAY_NAME_MAP[key as keyof typeof AU_STATE_CODE_TO_DISPLAY_NAME_MAP] ===
      stateName,
  )
  return stateCode as AUStateCode | undefined
}

export const isValidAUStateCode = (code: string) => {
  return code.toUpperCase() in AU_STATE_CODE_TO_DISPLAY_NAME_MAP
}
