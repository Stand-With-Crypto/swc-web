import { RecentActivityAndLeaderboardTabs } from '@/components/app/recentActivityAndLeaderboard/recentActivityAndLeaderboardTabs'
import { DEFAULT_LOCALE, SupportedLocale } from '@/intl/locales'

export const getIntlUrls = (locale: SupportedLocale) => {
  const localePrefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`
  return {
    home: () => `${locale === DEFAULT_LOCALE ? '/' : localePrefix}`,
    termsOfService: () => `${localePrefix}/terms-of-service`,
    privacyPolicy: () => `${localePrefix}/privacy`,
    about: () => `${localePrefix}/about`,
    leaderboard: (params?: { pageNum: number; tab: RecentActivityAndLeaderboardTabs }) => {
      if (!params) {
        return `${localePrefix}/leaderboard`
      }
      const tabPath =
        params.tab === RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY ? '' : `/${params.tab}`
      return `${localePrefix}/leaderboard${
        params.pageNum !== 1 || tabPath ? `/${params.pageNum}${tabPath}` : ''
      }`
    },
    politiciansHomepage: () => `${localePrefix}/politicians`,
    politicianDetails: (dtsiSlug: string) => `${localePrefix}/politicians/person/${dtsiSlug}`,
    // TODO delete before v2 go-live
    sampleArchitecturePatterns: () => `${localePrefix}/sample-architecture-patterns`,
  }
}

export const externalUrls = {
  emailFeedback: () => 'mailto:info@standwithcrypto.org',
  twitter: () => 'https://twitter.com/standwithcrypto',
  youtube: () => 'https://www.youtube.com/@StandWithCryptoAlliance/featured',
  instagram: () => 'https://www.instagram.com/standwithcrypto',
  facebook: () => 'https://www.facebook.com/standwithcrypto',
  linkedin: () => 'https://www.linkedin.com/company/standwithcrypto/',
  discord: () => 'https://discord.com/invite/standwithcrypto',
  dtsi: () => 'https://www.dotheysupportit.com',
  dtsiCreateStance: (slug: string) =>
    `https://www.dotheysupportit.com/people/${slug}/create-stance`,
}

export const apiUrls = {
  leaderboard: (offset: number) => `/api/leaderboard/${offset}`,
  totalDonations: (locale: SupportedLocale) => `/api/total-donations/${locale}`,
  mockTotalDonations: (locale: SupportedLocale) => `/api/mock-total-donations/${locale}`,
  performedUserActionTypes: () => `/api/authenticated/performed-user-action-types`,
  dtsiAllPeople: () => `/api/dtsi/all-people`,
}
