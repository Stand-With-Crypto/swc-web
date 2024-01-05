import { RecentActivityAndLeaderboardTabs } from '@/components/app/recentActivityAndLeaderboard/recentActivityAndLeaderboardTabs'
import { DEFAULT_LOCALE, SupportedLocale } from '@/intl/locales'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export const getIntlUrls = (
  locale: SupportedLocale,
  {
    actualPaths,
  }: {
    // when triggering vercel logic like revalidatePath, we need the actual paths, not the paths that get rewritten in our middleware (for example, all /en paths get rewritten to /)
    actualPaths?: true
  } = {},
) => {
  const localePrefix = locale === DEFAULT_LOCALE && !actualPaths ? '' : `/${locale}`
  return {
    home: () => `${locale === DEFAULT_LOCALE ? '/' : localePrefix}`,
    termsOfService: () => `${localePrefix}/terms-of-service`,
    privacyPolicy: () => `${localePrefix}/privacy`,
    about: () => `${localePrefix}/about`,
    resources: () => `${localePrefix}/resources`,
    donate: () => `${localePrefix}/donate`,
    leaderboard: (params?: { pageNum?: number; tab: RecentActivityAndLeaderboardTabs }) => {
      if (!params) {
        return `${localePrefix}/leaderboard`
      }
      const pageNum = params.pageNum ?? 1
      const tabPath =
        params.tab === RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY ? '' : `/${params.tab}`
      return `${localePrefix}/leaderboard${pageNum !== 1 || tabPath ? `/${pageNum}${tabPath}` : ''}`
    },
    politiciansHomepage: () => `${localePrefix}/politicians`,
    politicianDetails: (dtsiSlug: string) => `${localePrefix}/politicians/person/${dtsiSlug}`,
    // TODO delete before v2 go-live
    sampleArchitecturePatterns: () => `${localePrefix}/sample-architecture-patterns`,
  }
}

export const externalUrls = {
  discord: () => 'https://discord.com/invite/standwithcrypto',
  donate: () => 'https://commerce.coinbase.com/checkout/396fc233-3d1f-4dd3-8e82-6efdf78432ad',
  dtsi: () => 'https://www.dotheysupportit.com',
  dtsiCreateStance: (slug: string) =>
    `https://www.dotheysupportit.com/people/${slug}/create-stance`,
  emailFeedback: () => 'mailto:info@standwithcrypto.org',
  facebook: () => 'https://www.facebook.com/standwithcrypto',
  instagram: () => 'https://www.instagram.com/standwithcrypto',
  linkedin: () => 'https://www.linkedin.com/company/standwithcrypto/',
  twitter: () => 'https://twitter.com/standwithcrypto',
  youtube: () => 'https://www.youtube.com/@StandWithCryptoAlliance/featured',
}

export const apiUrls = {
  leaderboard: (offset: number) => `/api/leaderboard/${offset}`,
  dtsiPeopleByCongressionalDistrict: ({
    stateCode,
    districtNumber,
  }: {
    stateCode: string
    districtNumber: number
  }) => `/api/dtsi/by-geography/usa/${stateCode}/${districtNumber}`,
  totalDonations: (locale: SupportedLocale) => `/api/total-donations/${locale}`,
  mockTotalDonations: (locale: SupportedLocale) => `/api/mock-total-donations/${locale}`,
  performedUserActionTypes: () => `/api/authenticated/performed-user-action-types`,
  dtsiAllPeople: () => `/api/dtsi/all-people`,
}

export const fullUrl = (path: string) => {
  switch (NEXT_PUBLIC_ENVIRONMENT) {
    case 'local':
      return `http://localhost:3000${path}`
    case 'testing':
      return `https://swc-web-testing.vercel.app${path}`
    case 'production':
      return `https://www.standwithcrypto.org${path}`
  }
}
