import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/recentActivityAndLeaderboardTabs'
import { GetRacesParams } from '@/data/decisionDesk/schemas'
import { DEFAULT_LOCALE, SupportedLocale } from '@/intl/locales'
import { NormalizedDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { USStateCode } from '@/utils/shared/usStateUtils'

export const getIntlPrefix = (locale: SupportedLocale) =>
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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
    home: () => `${locale === DEFAULT_LOCALE ? '/' : localePrefix}`,
    termsOfService: () => `${localePrefix}/terms-of-service`,
    privacyPolicy: () => `${localePrefix}/privacy`,
    about: () => `${localePrefix}/about`,
    resources: () => `${localePrefix}/resources`,
    bills: () => `${localePrefix}/bills`,
    billDetails: (billSlug: string) => `${localePrefix}/bills/${billSlug}`,
    contribute: () => `${localePrefix}/contribute`,
    questionnaire: () => `${localePrefix}/questionnaire`,
    donate: () => `${localePrefix}/donate`,
    leaderboard: (params?: { pageNum?: number; tab: RecentActivityAndLeaderboardTabs }) => {
      const tabPrefix =
        params?.tab === RecentActivityAndLeaderboardTabs.LEADERBOARD
          ? '/community/leaderboard'
          : '/community'

      if (!params) {
        return `${localePrefix}${tabPrefix}`
      }
      const pageNum = params.pageNum ?? 1
      const shouldSuppressPageNum = pageNum === 1
      const tabSuffix = shouldSuppressPageNum ? '' : `/${pageNum}`
      return `${localePrefix}${tabPrefix}${tabSuffix}`
    },
    partners: () => `${localePrefix}/partners`,
    politiciansHomepage: () => `${localePrefix}/politicians`,
    politicianDetails: (dtsiSlug: string) => `${localePrefix}/politicians/person/${dtsiSlug}`,
    profile: () => `${localePrefix}/profile`,
    updateProfile: () => `${localePrefix}/profile?hasOpenUpdateUserProfileForm=true`,
    internalHomepage: () => `${localePrefix}/internal`,
    locationStateSpecific: (stateCode: USStateCode) =>
      `${localePrefix}/races/state/${stateCode.toLowerCase()}`,
    locationStateSpecificSenateRace: (stateCode: USStateCode) =>
      `${localePrefix}/races/state/${stateCode.toLowerCase()}/senate`,
    locationUnitedStatesPresidential: () => `${localePrefix}/races/presidential`,
    locationUnitedStates: () => `${localePrefix}/races/`,
    endorsedCandidates: () => `${localePrefix}/races/endorsed/`,
    locationDistrictSpecific: ({
      stateCode,
      district,
    }: {
      stateCode: USStateCode
      district: NormalizedDTSIDistrictId
    }) => `${localePrefix}/races/state/${stateCode.toLowerCase()}/district/${district}`,
    becomeMember: () => `${localePrefix}/action/become-member`,
    community: () => `${localePrefix}/community`,
    events: () => `${localePrefix}/events`,
    voterGuide: () => `${localePrefix}/vote`,
    advocacyToolkit: () => `${localePrefix}/advocacy-toolkit`,
    creatorDefenseFund: () => `${localePrefix}/creator-defense-fund`,
    press: () => `${localePrefix}/press`,
  }
}

const NEXT_PUBLIC_VERCEL_URL = requiredOutsideLocalEnv(
  process.env.NEXT_PUBLIC_VERCEL_URL,
  'NEXT_PUBLIC_VERCEL_URL',
  null,
)

export const fullUrl = (path: string) => {
  switch (NEXT_PUBLIC_ENVIRONMENT) {
    case 'local':
      return `http://localhost:3000${path}`
    case 'testing':
      return `https://testing.standwithcrypto.org${path}`
    case 'preview':
      return `https://${NEXT_PUBLIC_VERCEL_URL!}${path}`
    case 'production':
      return `https://www.standwithcrypto.org${path}`
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
  instagram: () => 'https://www.instagram.com/standwithcrypto/',
  linkedin: () => 'https://www.linkedin.com/company/standwithcrypto/',
  twitter: () => 'https://twitter.com/standwithcrypto',
  youtube: () => 'https://www.youtube.com/@StandWithCryptoAlliance/featured',
  swcOnChainSummer: () => 'https://onchainsummer.xyz/standwithcrypto',
  swcReferralUrl: ({ referralId }: { referralId: string }) =>
    `https://www.standwithcrypto.org/join/${referralId}`,
  swcQuestionnaire: () => 'https://standwithcrypto.typeform.com/questionnaire',
}

export const apiUrls = {
  dtsiPeopleByCongressionalDistrict: ({
    stateCode,
    districtNumber,
  }: {
    stateCode: string
    districtNumber: number
  }) => `/api/public/dtsi/by-geography/usa/${stateCode}/${districtNumber}`,
  totalDonations: (locale: SupportedLocale) => `/api/public/total-donations/${locale}`,
  userPerformedUserActionTypes: () => `/api/identified-user/performed-user-action-types`,
  userFullProfileInfo: () => `/api/identified-user/full-profile-info`,
  detectWipedDatabase: () => `/api/identified-user/detect-wiped-database`,
  dtsiAllPeople: () => `/api/public/dtsi/all-people`,
  recentActivity: ({ limit, restrictToUS }: { limit: number; restrictToUS?: boolean }) =>
    `/api/public/recent-activity/${limit}${restrictToUS ? '/restrictToUS' : ''}`,
  homepageTopLevelMetrics: () => `/api/public/homepage/top-level-metrics`,
  unidentifiedUser: ({ sessionId }: { sessionId: string }) => `/api/unidentified-user/${sessionId}`,
  billVote: ({ slug, billId }: { slug: string; billId: string }) =>
    `/api/public/dtsi/bill-vote/${billId}/${slug}`,
  totalAdvocatesPerState: () => '/api/public/advocates-map/total-advocates-per-state',
  dtsiRacesByCongressionalDistrict: ({
    stateCode,
    district,
  }: {
    stateCode: string
    district: number
  }) => `/api/public/dtsi/races/usa/${stateCode}/${district}`,
  smsStatusCallback: () => `/api/public/sms/events/status`,
  decisionDeskRaces: (params?: GetRacesParams): string => {
    const endpointURL = new URL('api/public/decision-desk/usa')
    const paramsEntries = Object.entries(params ?? {})
    const currentURLSearchParams = new URLSearchParams({
      year: '2024',
    })

    if (paramsEntries.length > 0) {
      paramsEntries.forEach(([key, value]) => {
        currentURLSearchParams.set(key, value.toString())
      })
    }

    endpointURL.search = currentURLSearchParams.toString()

    return endpointURL.href
  },
}
