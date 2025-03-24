import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

function getBaseUrl() {
  switch (NEXT_PUBLIC_ENVIRONMENT) {
    case 'production':
      return 'https://www.standwithcrypto.org'
    case 'preview':
      return `https://${process.env.VERCEL_URL!}`
    default:
      return 'http://localhost:3000'
  }
}

export const INTERNAL_BASE_URL = getBaseUrl()

export const getIntlPrefix = (countryCode: SupportedCountryCodes) =>
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  countryCode === DEFAULT_SUPPORTED_COUNTRY_CODE ? '' : `/${countryCode}`

export const getIntlUrls = (
  countryCode: SupportedCountryCodes,
  {
    actualPaths,
  }: {
    // when triggering vercel logic like revalidatePath, we need the actual paths, not the paths that get rewritten in our middleware (for example, all /en paths get rewritten to /)
    actualPaths?: true
  } = {},
) => {
  const countryPrefix =
    countryCode === DEFAULT_SUPPORTED_COUNTRY_CODE && !actualPaths ? '' : `/${countryCode}`
  return {
    home: () => `${countryCode === DEFAULT_SUPPORTED_COUNTRY_CODE ? '/' : countryPrefix}`,
    termsOfService: () => `${countryPrefix}/terms-of-service`,
    privacyPolicy: () => `${countryPrefix}/privacy`,
    about: () => `${countryPrefix}/about`,
    // Uses Next.js rewrite function to render the same page as /about
    manifesto: () => `${countryPrefix}/manifesto`,
    resources: () => `${countryPrefix}/resources`,
    bills: () => `${countryPrefix}/bills`,
    billDetails: (billSlug: string) => `${countryPrefix}/bills/${billSlug}`,
    contribute: () => `${countryPrefix}/contribute`,
    questionnaire: () => `${countryPrefix}/questionnaire`,
    donate: () => `${countryPrefix}/donate`,
    leaderboard: (params?: { pageNum?: number; tab: RecentActivityAndLeaderboardTabs }) => {
      const getTabPrefix = (tab = RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY) => {
        switch (tab) {
          case RecentActivityAndLeaderboardTabs.LEADERBOARD:
            return '/community/leaderboard'
          case RecentActivityAndLeaderboardTabs.TOP_DISTRICTS:
            return '/community/referrals'
          case RecentActivityAndLeaderboardTabs.RECENT_ACTIVITY:
          default:
            return '/community'
        }
      }
      const tabPrefix = getTabPrefix(params?.tab)
      if (!params) {
        return `${countryPrefix}${tabPrefix}`
      }
      const pageNum = params.pageNum ?? 1
      const shouldSuppressPageNum = pageNum === 1
      const tabSuffix = shouldSuppressPageNum ? '' : `/${pageNum}`
      return `${countryPrefix}${tabPrefix}${tabSuffix}`
    },
    partners: () => `${countryPrefix}/partners`,
    founders: () => `${countryPrefix}/founders`,
    politiciansHomepage: () => `${countryPrefix}/politicians`,
    politicianDetails: (dtsiSlug: string) => `${countryPrefix}/politicians/person/${dtsiSlug}`,
    profile: () => `${countryPrefix}/profile`,
    updateProfile: () => `${countryPrefix}/profile?hasOpenUpdateUserProfileForm=true`,
    internalHomepage: () => `${countryPrefix}/internal`,
    becomeMember: () => `${countryPrefix}/action/become-member`,
    community: () => `${countryPrefix}/community`,
    events: () => `${countryPrefix}/events`,
    advocacyToolkit: () => `${countryPrefix}/advocacy-toolkit`,
    creatorDefenseFund: () => `${countryPrefix}/creator-defense-fund`,
    press: () => `${countryPrefix}/press`,
    emailDeeplink: () => `${countryPrefix}/action/email`,
    polls: () => `${countryPrefix}/polls`,
    referrals: (pageNum?: number) => {
      const shouldSuppressPageNum = pageNum === 1
      const pageSuffix = shouldSuppressPageNum ? '' : `/${pageNum ?? 1}`
      return `${countryPrefix}/referrals${pageSuffix}`
    },
  }
}

export const apiUrls = {
  dtsiPeopleByCongressionalDistrict: ({
    stateCode,
    districtNumber,
  }: {
    stateCode: string
    districtNumber: number
  }) => `/api/public/dtsi/by-geography/usa/${stateCode}/${districtNumber}`,
  totalDonations: () => '/api/public/total-donations',
  userPerformedUserActionTypes: () => `/api/identified-user/performed-user-action-types`,
  userFullProfileInfo: () => `/api/identified-user/full-profile-info`,
  detectWipedDatabase: () => `/api/identified-user/detect-wiped-database`,
  dtsiAllPeople: () => `/api/public/dtsi/all-people`,
  recentActivity: ({ limit, countryCode }: { limit: number; countryCode: string }) =>
    `/api/public/recent-activity/${limit}/${countryCode}`,
  homepageTopLevelMetrics: () => `/api/public/homepage/top-level-metrics`,
  unidentifiedUser: ({ sessionId }: { sessionId: string }) => `/api/unidentified-user/${sessionId}`,
  billVote: ({ slug, billId }: { slug: string; billId: string }) =>
    `/api/public/dtsi/bill-vote/${billId}/${slug}`,
  totalAdvocatesPerState: () => '/api/public/advocates-map/total-advocates-per-state',
  smsStatusCallback: ({
    campaignName,
    journeyType,
    hasWelcomeMessageInBody,
  }: {
    campaignName: string
    journeyType: string
    hasWelcomeMessageInBody?: boolean
  }) =>
    `/api/public/sms/events/status?campaignName=${campaignName}&journeyType=${journeyType}&hasWelcomeMessageInBody=${String(hasWelcomeMessageInBody ?? false)}`,
  pollsVotesFromUser: ({ userId }: { userId?: string }) =>
    `/api/identified-user/polls-votes-from-user?userId=${userId ?? ''}`,
  pollsResultsData: () => `/api/public/polls`,
  districtRanking: ({ stateCode, districtNumber }: { stateCode: string; districtNumber: string }) =>
    `/api/public/referrals/${stateCode}/${districtNumber}`,
}

export * from './externalUrls'
export * from './fullUrl'
