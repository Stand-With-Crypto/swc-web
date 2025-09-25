import { SupportedLanguagesByCountryCode } from '@/utils/shared/i18n/types'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLanguages } from '@/utils/shared/supportedLocales'

export function getSupportedLanguagesForCountry(
  countryCode: SupportedCountryCodes,
): SupportedLanguagesByCountryCode[typeof countryCode] {
  const languageMap: SupportedLanguagesByCountryCode = {
    [SupportedCountryCodes.US]: [SupportedLanguages.EN],
    [SupportedCountryCodes.AU]: [SupportedLanguages.EN],
    [SupportedCountryCodes.CA]: [SupportedLanguages.EN],
    [SupportedCountryCodes.GB]: [SupportedLanguages.EN],
    [SupportedCountryCodes.EU]: [
      SupportedLanguages.FR,
      SupportedLanguages.DE,
      SupportedLanguages.EN,
    ],
  }

  return languageMap[countryCode]
}
