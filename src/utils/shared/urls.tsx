import { SUPPORTED_LOCALE } from './locales'

export const getIntlUrls = (locale: SUPPORTED_LOCALE) => {
  return {
    home: () => `/${locale}`,
    // TODO delete before v2 go-live
    sampleArchitecturePatterns: () => `/${locale}/sample-architecture-patterns`,
  }
}

export const apiUrls = {
  leaderboard: (offset: number) => `/api/leaderboard/${offset}`,
}
