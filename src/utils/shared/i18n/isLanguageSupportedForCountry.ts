import { getSupportedLanguagesForCountry } from '@/utils/shared/i18n/getSupportedLanguagesByCountry'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

export function isLanguageSupportedForCountry(
  countryCode: SupportedCountryCodes,
  language: SupportedLanguages,
): boolean {
  const languages = getSupportedLanguagesForCountry(countryCode)

  return languages?.includes(language)
}
