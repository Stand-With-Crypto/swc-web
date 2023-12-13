import { SUPPORTED_LOCALE } from './locales'

export const getIntlUrls = (locale: SUPPORTED_LOCALE) => {
  return {
    home: () => `/${locale}`,
  }
}

export const apiUrls = {
  leaderboard: (offset: number) => `/api/leaderboard/${offset}`,
}
