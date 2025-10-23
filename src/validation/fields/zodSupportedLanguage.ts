import { string } from 'zod'

import { ORDERED_SUPPORTED_EU_LANGUAGES, SupportedLanguages } from '@/utils/shared/supportedLocales'

export const zodSupportedLanguage = string()
  .default(SupportedLanguages.EN)
  .refine(value => ORDERED_SUPPORTED_EU_LANGUAGES.includes(value), {
    message: 'Language not supported',
  })
  .transform(value => value as SupportedLanguages)
