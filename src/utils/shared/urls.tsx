import { SUPPORTED_LOCALE } from './locales'

export const getIntlUrls = (locale: SUPPORTED_LOCALE) => {
  return {
    home: () => `/${locale}`,
  }
}
