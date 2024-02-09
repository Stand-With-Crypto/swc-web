import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import { DEFAULT_LOCALE, SupportedLocale } from '@/intl/locales'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export const getIntlPrefix = (locale: SupportedLocale) =>
  locale === DEFAULT_LOCALE ? '' : `/${locale}`

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
    about: () => `${localePrefix}/about`,
    donate: () => `${localePrefix}/donate`,
    home: () => `${locale === DEFAULT_LOCALE ? '/' : localePrefix}`,
    internalHomepage: () => `${localePrefix}/internal`,
    leaderboard: (params?: { pageNum?: number; tab: RecentActivityAndLeaderboardTabs }) => {
      if (!params) {
        return `${localePrefix}/leaderboard`
      }
      const pageNum = params.pageNum ?? 1
      const tabPath =
        params.tab === RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY ? '' : `/${params.tab}`
      return `${localePrefix}/leaderboard${pageNum !== 1 || tabPath ? `/${pageNum}${tabPath}` : ''}`
    },
    politicianDetails: (dtsiSlug: string) => `${localePrefix}/politicians/person/${dtsiSlug}`,
    politiciansHomepage: () => `${localePrefix}/politicians`,
    privacyPolicy: () => `${localePrefix}/privacy`,
    profile: () => `${localePrefix}/profile`,
    resources: () => `${localePrefix}/resources`,
    termsOfService: () => `${localePrefix}/terms-of-service`,
  }
}

export const externalUrls = {
  discord: () => 'https://discord.com/invite/standwithcrypto',
  donate: () =>
    NEXT_PUBLIC_ENVIRONMENT === 'production'
      ? 'https://commerce.coinbase.com/checkout/396fc233-3d1f-4dd3-8e82-6efdf78432ad'
      : 'https://commerce.coinbase.com/checkout/582a836d-733c-4a66-84d9-4e3c40c90281',
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
  detectWipedDatabase: () => `/api/identified-user/detect-wiped-database`,
  dtsiAllPeople: () => `/api/public/dtsi/all-people`,
  dtsiPeopleByCongressionalDistrict: ({
    stateCode,
    districtNumber,
  }: {
    stateCode: string
    districtNumber: number
  }) => `/api/public/dtsi/by-geography/usa/${stateCode}/${districtNumber}`,
  homepageTopLevelMetrics: () => `/api/public/homepage/top-level-metrics`,
  mockLeaderboard: (offset: number) => `/api/mock/leaderboard/${offset}`,
  mockTotalDonations: (locale: SupportedLocale) => `/api/mock/total-donations/${locale}`,
  recentActivity: ({ limit }: { limit: number }) => `/api/public/recent-activity/${limit}`,
  totalDonations: (locale: SupportedLocale) => `/api/public/total-donations/${locale}`,
  userFullProfileInfo: () => `/api/identified-user/full-profile-info`,
  userPerformedUserActionTypes: () => `/api/identified-user/performed-user-action-types`,
}

const NEXT_PUBLIC_VERCEL_URL = requiredOutsideLocalEnv(
  process.env.NEXT_PUBLIC_VERCEL_URL,
  'NEXT_PUBLIC_VERCEL_URL',
)

export const fullUrl = (path: string) => {
  switch (NEXT_PUBLIC_ENVIRONMENT) {
    case 'local':
      return `http://localhost:3000${path}`
    case 'testing':
      return `https://swc-web-testing.vercel.app${path}`
    case 'preview':
      return `${NEXT_PUBLIC_VERCEL_URL!}${path}`
    case 'production':
      return `https://www.standwithcrypto.org${path}`
  }
}
