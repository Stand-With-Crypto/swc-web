import { SupportedLanguages } from '@/utils/shared/supportedLocales'

// EU countries and their primary languages
export const EU_COUNTRY_TO_PRIMARY_LANGUAGE: Record<string, SupportedLanguages> = {
  // German-speaking countries
  at: SupportedLanguages.DE, // Austria
  de: SupportedLanguages.DE, // Germany

  // French-speaking countries
  fr: SupportedLanguages.FR, // France
  be: SupportedLanguages.FR, // Belgium (multilingual, but French is commonly used)
  lu: SupportedLanguages.FR, // Luxembourg (multilingual, but French is commonly used)

  // English-speaking countries
  ie: SupportedLanguages.EN, // Ireland
  mt: SupportedLanguages.EN, // Malta
  cy: SupportedLanguages.EN, // Cyprus

  // Countries that default to English (most common international language)
  bg: SupportedLanguages.EN, // Bulgaria
  hr: SupportedLanguages.EN, // Croatia
  cz: SupportedLanguages.EN, // Czech Republic
  dk: SupportedLanguages.EN, // Denmark
  ee: SupportedLanguages.EN, // Estonia
  fi: SupportedLanguages.EN, // Finland
  gr: SupportedLanguages.EN, // Greece
  hu: SupportedLanguages.EN, // Hungary
  it: SupportedLanguages.EN, // Italy
  lv: SupportedLanguages.EN, // Latvia
  lt: SupportedLanguages.EN, // Lithuania
  nl: SupportedLanguages.EN, // Netherlands
  pl: SupportedLanguages.EN, // Poland
  pt: SupportedLanguages.EN, // Portugal
  ro: SupportedLanguages.EN, // Romania
  sk: SupportedLanguages.EN, // Slovakia
  si: SupportedLanguages.EN, // Slovenia
  es: SupportedLanguages.EN, // Spain
  se: SupportedLanguages.EN, // Sweden
}

export const EU_COUNTRY_CODES = Object.keys(EU_COUNTRY_TO_PRIMARY_LANGUAGE)

export function isEUCountry(countryCode: string): boolean {
  return EU_COUNTRY_CODES.includes(countryCode.toLowerCase())
}

export function getEUCountryPrimaryLanguage(countryCode: string): SupportedLanguages | null {
  return EU_COUNTRY_TO_PRIMARY_LANGUAGE[countryCode.toLowerCase()] || null
}
