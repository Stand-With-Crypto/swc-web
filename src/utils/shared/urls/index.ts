import { RecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import { AUStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import { CAProvinceOrTerritoryCode } from '@/utils/shared/stateMappings/caProvinceUtils'
import { GBCountryCode } from '@/utils/shared/stateMappings/gbCountryUtils'
import { USStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

export type LocationStateCode =
  | USStateCode
  | GBCountryCode
  | AUStateCode
  | CAProvinceOrTerritoryCode

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

const COUNTRY_CODE_TO_RACES_ROUTES_SEGMENTS: Record<
  SupportedCountryCodes,
  {
    state: string
    district: string
  }
> = {
  [SupportedCountryCodes.US]: {
    state: 'state',
    district: 'district',
  },
  [SupportedCountryCodes.GB]: {
    state: 'province',
    district: 'constituency',
  },
  [SupportedCountryCodes.AU]: {
    state: 'state',
    district: 'constituency',
  },
  [SupportedCountryCodes.CA]: {
    state: 'province',
    district: 'constituency',
  },
}

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

  const racesRoutesSegments = COUNTRY_CODE_TO_RACES_ROUTES_SEGMENTS[countryCode]
  const RACES_ROUTES = {
    locationStateSpecific: (stateCode: LocationStateCode) =>
      `${countryPrefix}/races/${racesRoutesSegments.state}/${stateCode.toLowerCase()}`,
    locationStateSpecificSenateRace: (stateCode: LocationStateCode) =>
      `${countryPrefix}/races/${racesRoutesSegments.state}/${stateCode.toLowerCase()}/senate`,
    locationStateSpecificHouseOfRepsRace: (stateCode: LocationStateCode) =>
      `${countryPrefix}/races/${racesRoutesSegments.state}/${stateCode.toLowerCase()}/house-of-representatives`,
    locationStateSpecificGovernorRace: (stateCode: LocationStateCode) =>
      `${countryPrefix}/races/${racesRoutesSegments.state}/${stateCode.toLowerCase()}/governor`,
    locationKeyRaces: () => `${countryPrefix}/races/`,
    locationDistrictSpecific: ({
      stateCode,
      district,
    }: {
      stateCode: LocationStateCode
      district: string | number
    }) =>
      `${countryPrefix}/races/${racesRoutesSegments.state}/${stateCode.toLowerCase()}/${racesRoutesSegments.district}/${district}`,
    locationDistrictSpecificHouseOfReps: ({
      stateCode,
      district,
    }: {
      stateCode: LocationStateCode
      district: string | number
    }) =>
      `${countryPrefix}/races/${racesRoutesSegments.state}/${stateCode.toLowerCase()}/${racesRoutesSegments.district}/${district}/house-of-representatives`,
    locationDistrictSpecificHouseOfCommons: ({
      stateCode,
      district,
    }: {
      stateCode: LocationStateCode
      district: string | number
    }) =>
      `${countryPrefix}/races/${racesRoutesSegments.state}/${stateCode.toLowerCase()}/${racesRoutesSegments.district}/${district}/house-of-commons`,
  }

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
    politiciansHomepage: () => `${countryPrefix}/politicians`,
    politicianDetails: (dtsiSlug: string) => `${countryPrefix}/politicians/person/${dtsiSlug}`,
    profile: () => `${countryPrefix}/profile`,
    updateProfile: () => `${countryPrefix}/profile?hasOpenUpdateUserProfileForm=true`,
    internalHomepage: () => '/internal',
    becomeMember: () => `${countryPrefix}/action/become-member`,
    community: () => `${countryPrefix}/community`,
    events: () => `${countryPrefix}/events`,
    eventDeepLink: (state: string, eventSlug: string) =>
      `${countryPrefix}/events/${state}/${eventSlug}`,
    advocacyToolkit: () => `${countryPrefix}/advocacy-toolkit`,
    creatorDefenseFund: () => `${countryPrefix}/creator-defense-fund`,
    press: () => `${countryPrefix}/press`,
    emailDeeplink: () => `${countryPrefix}/action/email`,
    polls: () => `${countryPrefix}/polls`,
    referrals: (pageNum?: number) => {
      const shouldSuppressPageNum = (pageNum ?? 1) === 1
      const pageSuffix = shouldSuppressPageNum ? '' : `/${pageNum ?? 1}`
      return `${countryPrefix}/referrals${pageSuffix}`
    },
    newmodeElectionAction: () => `${countryPrefix}/content/election`,
    newmodeDebankingAction: () => `${countryPrefix}/content/debanking`,
    ...RACES_ROUTES,
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
  userPerformedUserActionTypes: ({ countryCode }: { countryCode: SupportedCountryCodes }) =>
    `/api/${countryCode}/identified-user/performed-user-action-types`,
  userFullProfileInfo: () => `/api/identified-user/full-profile-info`,
  detectWipedDatabase: () => `/api/identified-user/detect-wiped-database`,
  dtsiAllPeople: ({ countryCode }: { countryCode: SupportedCountryCodes }) =>
    `/api/public/dtsi/all-people/${countryCode}`,
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
  pollsVotesFromUser: ({ countryCode }: { countryCode: SupportedCountryCodes }) =>
    `/api/${countryCode}/identified-user/polls-votes-from-user`,
  pollsResultsData: ({ countryCode }: { countryCode: SupportedCountryCodes }) =>
    `/api/${countryCode}/public/polls`,
  districtRanking: ({ stateCode, districtNumber }: { stateCode: string; districtNumber: string }) =>
    `/api/public/referrals/${stateCode}/${districtNumber}`,
  dtsiRacesByCongressionalDistrict: ({
    stateCode,
    district,
  }: {
    stateCode: string
    district: number
  }) => `/api/public/dtsi/races/usa/${stateCode}/${district}`,
}

export * from './externalUrls'
export * from './fullUrl'
