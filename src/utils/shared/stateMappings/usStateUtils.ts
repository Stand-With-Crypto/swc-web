export const US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
} as const

const US_TERRITORY_STATE_CODE_TO_DISPLAY_NAME_MAP = {
  GU: 'Guam',
  PR: 'Puerto Rico',
  VI: 'Virgin Islands',
  AS: 'American Samoa',
  DC: 'District Of Columbia',
} as const

export const US_STATE_CODE_TO_DISPLAY_NAME_MAP = {
  ...US_MAIN_STATE_CODE_TO_DISPLAY_NAME_MAP,
  ...US_TERRITORY_STATE_CODE_TO_DISPLAY_NAME_MAP,
} as const

export type USStateCode = keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP

export const getUSStateNameFromStateCode = (stateCode: string) => {
  // @ts-ignore
  const name: string = US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode.toUpperCase()]
  if (name) {
    return name
  }
  return stateCode
}

export const getUSStateCodeFromStateName = (stateName: string) => {
  const stateCode = Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP).find(
    key =>
      US_STATE_CODE_TO_DISPLAY_NAME_MAP[key as keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP] ===
      stateName,
  )
  return stateCode as USStateCode | undefined
}

export const isValidUSStateCode = (stateCode: string) =>
  stateCode.toUpperCase() in US_STATE_CODE_TO_DISPLAY_NAME_MAP
