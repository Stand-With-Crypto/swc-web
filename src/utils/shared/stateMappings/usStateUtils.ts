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
}

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

export const US_STATE_NUMBER_TO_STATE_CODE: Record<number, USStateCode> = {
  1: 'AL',
  2: 'AK',
  4: 'AZ',
  5: 'AR',
  6: 'CA',
  8: 'CO',
  9: 'CT',
  10: 'DE',
  11: 'DC',
  12: 'FL',
  13: 'GA',
  15: 'HI',
  16: 'ID',
  17: 'IL',
  18: 'IN',
  19: 'IA',
  20: 'KS',
  21: 'KY',
  22: 'LA',
  23: 'ME',
  24: 'MD',
  25: 'MA',
  26: 'MI',
  27: 'MN',
  28: 'MS',
  29: 'MO',
  30: 'MT',
  31: 'NE',
  32: 'NV',
  33: 'NH',
  34: 'NJ',
  35: 'NM',
  36: 'NY',
  37: 'NC',
  38: 'ND',
  39: 'OH',
  40: 'OK',
  41: 'OR',
  42: 'PA',
  44: 'RI',
  45: 'SC',
  46: 'SD',
  47: 'TN',
  48: 'TX',
  49: 'UT',
  50: 'VT',
  51: 'VA',
  53: 'WA',
  54: 'WV',
  55: 'WI',
  56: 'WY',
}
