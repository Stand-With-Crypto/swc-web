import { DEFAULT_LOCALE, SUPPORTED_LOCALE } from '@/intl/locales'

export const getIntlUrls = (locale: SUPPORTED_LOCALE) => {
  const localePrefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`
  return {
    home: () => `${locale === DEFAULT_LOCALE ? '/' : localePrefix}`,
    politiciansHomepage: () => `${localePrefix}/politicians`,
    // TODO delete before v2 go-live
    sampleArchitecturePatterns: () => `${localePrefix}/sample-architecture-patterns`,
  }
}

export const apiUrls = {
  leaderboard: (offset: number) => `/api/leaderboard/${offset}`,
}
