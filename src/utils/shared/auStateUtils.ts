export const AUSTRALIA_STATE_CODE_TO_DISPLAY_NAME_MAP = {
  ACT: 'Australian Capital Territory',
  NSW: 'New South Wales',
  NT: 'Northern Territory',
  QLD: 'Queensland',
  SA: 'South Australia',
  TAS: 'Tasmania',
  VIC: 'Victoria',
  WA: 'Western Australia',
} as const

export type AustraliaStateCode = keyof typeof AUSTRALIA_STATE_CODE_TO_DISPLAY_NAME_MAP

export const getAUStateNameFromStateCode = (stateCode: string) => {
  // @ts-ignore
  const name: string = AUSTRALIA_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode.toUpperCase()]
  if (name) {
    return name
  }
  return stateCode
}

export const getAUStateCodeFromStateName = (stateName: string) => {
  const stateCode = Object.keys(AUSTRALIA_STATE_CODE_TO_DISPLAY_NAME_MAP).find(
    key =>
      AUSTRALIA_STATE_CODE_TO_DISPLAY_NAME_MAP[
        key as keyof typeof AUSTRALIA_STATE_CODE_TO_DISPLAY_NAME_MAP
      ] === stateName,
  )
  return stateCode as AustraliaStateCode | undefined
}
