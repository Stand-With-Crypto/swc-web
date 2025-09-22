import { SupportedEULanguages } from '@/utils/shared/supportedLocales'

// EU countries and their primary languages
export const EU_COUNTRY_TO_PRIMARY_LANGUAGE: Record<string, SupportedEULanguages> = {
  // German-speaking countries
  at: SupportedEULanguages.DE, // Austria
  de: SupportedEULanguages.DE, // Germany

  // French-speaking countries
  fr: SupportedEULanguages.FR, // France
  be: SupportedEULanguages.FR, // Belgium (multilingual, but French is commonly used)
  lu: SupportedEULanguages.FR, // Luxembourg (multilingual, but French is commonly used)

  // English-speaking countries
  ie: SupportedEULanguages.EN, // Ireland
  mt: SupportedEULanguages.EN, // Malta
  cy: SupportedEULanguages.EN, // Cyprus

  // Countries that default to English (most common international language)
  bg: SupportedEULanguages.EN, // Bulgaria
  hr: SupportedEULanguages.EN, // Croatia
  cz: SupportedEULanguages.EN, // Czech Republic
  dk: SupportedEULanguages.EN, // Denmark
  ee: SupportedEULanguages.EN, // Estonia
  fi: SupportedEULanguages.EN, // Finland
  gr: SupportedEULanguages.EN, // Greece
  hu: SupportedEULanguages.EN, // Hungary
  it: SupportedEULanguages.EN, // Italy
  lv: SupportedEULanguages.EN, // Latvia
  lt: SupportedEULanguages.EN, // Lithuania
  nl: SupportedEULanguages.EN, // Netherlands
  pl: SupportedEULanguages.EN, // Poland
  pt: SupportedEULanguages.EN, // Portugal
  ro: SupportedEULanguages.EN, // Romania
  sk: SupportedEULanguages.EN, // Slovakia
  si: SupportedEULanguages.EN, // Slovenia
  es: SupportedEULanguages.EN, // Spain
  se: SupportedEULanguages.EN, // Sweden
}

export const EU_COUNTRY_CODES = Object.keys(EU_COUNTRY_TO_PRIMARY_LANGUAGE)

export function isEUCountry(countryCode: string): boolean {
  return EU_COUNTRY_CODES.includes(countryCode.toLowerCase())
}

export function getEUCountryPrimaryLanguage(countryCode: string): SupportedEULanguages | null {
  return EU_COUNTRY_TO_PRIMARY_LANGUAGE[countryCode.toLowerCase()] || null
}
