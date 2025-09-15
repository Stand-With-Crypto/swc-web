import { AuRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/au/recentActivityAndLeaderboardTabs'
import { CaRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/ca/recentActivityAndLeaderboardTabs'
import { EuRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/eu/recentActivityAndLeaderboardTabs'
import { GbRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/gb/recentActivityAndLeaderboardTabs'
import { UsRecentActivityAndLeaderboardTabs } from '@/components/app/pageHome/us/recentActivityAndLeaderboardTabs'
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
    case 'testing':
      return 'https://testing.standwithcrypto.org'
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
  [SupportedCountryCodes.EU]: {
    state: 'country',
    district: 'constituency',
  },
}

type RecentActivityAndLeaderboardTabs =
  | UsRecentActivityAndLeaderboardTabs
  | AuRecentActivityAndLeaderboardTabs
  | CaRecentActivityAndLeaderboardTabs
  | GbRecentActivityAndLeaderboardTabs
  | EuRecentActivityAndLeaderboardTabs
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
    privacyCollectionStatement: () => `${countryPrefix}/privacy-collection-statement`,
    // Uses Next.js rewrite function to render the same page as /about
    manifesto: () => `${countryPrefix}/manifesto`,
    resources: () => `${countryPrefix}/resources`,
    bills: () => `${countryPrefix}/bills`,
    billsStateSpecific: (stateCode: string) =>
      `${countryPrefix}/bills/state/${stateCode.toLowerCase()}`,
    billDetails: (billSlug: string) => `${countryPrefix}/bills/${billSlug}`,
    petitions: () => `${countryPrefix}/petitions`,
    petitionDetails: (petitionSlug: string) => `${countryPrefix}/petitions/${petitionSlug}`,
    contribute: () => `${countryPrefix}/contribute`,
    questionnaire: () => `${countryPrefix}/questionnaire`,
    donate: () => `${countryPrefix}/donate`,
    recentActivity: (params: { stateCode: string; pageNumber?: number }) => {
      const pageNumber = params.pageNumber || 1
      const shouldSuppressPageNumber = pageNumber === 1
      const suffix = shouldSuppressPageNumber ? '' : `/${pageNumber}`
      return `${countryPrefix}/recent-activity/${params.stateCode.toLowerCase()}${suffix}`
    },
    community: (params?: { pageNum?: number; tab: RecentActivityAndLeaderboardTabs }) => {
      const getTabPrefix = (
        tab: RecentActivityAndLeaderboardTabs = UsRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
      ) => {
        switch (tab) {
          case UsRecentActivityAndLeaderboardTabs.LEADERBOARD:
            return '/community/leaderboard'
          case UsRecentActivityAndLeaderboardTabs.TOP_DISTRICTS:
          case AuRecentActivityAndLeaderboardTabs.TOP_DIVISIONS:
          case CaRecentActivityAndLeaderboardTabs.TOP_CONSTITUENCIES:
            return '/community/referrals'
          case UsRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY:
          case AuRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY:
          case CaRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY:
          case GbRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY:
          default:
            return '/community/activity'
        }
      }
      const tabPrefix = getTabPrefix(params?.tab)
      const pageNum = params?.pageNum ?? 1
      const shouldSuppressPageNum = pageNum === 1
      const tabSuffix = shouldSuppressPageNum ? '' : `/${pageNum}`
      return `${countryPrefix}${tabPrefix}${tabSuffix}`
    },
    communityStateSpecific: (params: {
      pageNum?: number
      tab:
        | UsRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY
        | UsRecentActivityAndLeaderboardTabs.TOP_DISTRICTS
      stateCode: string
    }) => {
      const statePrefix = `/community/${params.stateCode.toLowerCase()}`
      const getTabPrefix = (
        tab: UsRecentActivityAndLeaderboardTabs = UsRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY,
      ) => {
        switch (tab) {
          case UsRecentActivityAndLeaderboardTabs.TOP_DISTRICTS:
            return `${statePrefix}/referrals`
          case UsRecentActivityAndLeaderboardTabs.RECENT_ACTIVITY:
          default:
            return statePrefix
        }
      }
      const tabPrefix = getTabPrefix(params.tab)
      const pageNum = params.pageNum ?? 1
      const shouldSuppressPageNum = pageNum === 1
      const tabSuffix = shouldSuppressPageNum ? '' : `/${pageNum}`
      return `${countryPrefix}${tabPrefix}${tabSuffix}`
    },
    partners: () => `${countryPrefix}/partners`,
    politiciansHomepage: ({
      filters,
      hash,
    }: { filters?: Partial<{ state: string }>; hash?: string } = {}) => {
      const params = new URLSearchParams(filters).toString()

      return `${countryPrefix}/politicians${params ? `?${params}` : ''}${hash ? `#${hash}` : ''}`
    },
    politicianDetails: (dtsiSlug: string) => `${countryPrefix}/politicians/person/${dtsiSlug}`,
    profile: () => `${countryPrefix}/profile`,
    updateProfile: () => `${countryPrefix}/profile?hasOpenUpdateUserProfileForm=true`,
    internalHomepage: () => '/internal',
    becomeMember: () => `${countryPrefix}/action/become-member`,
    events: () => `${countryPrefix}/events`,
    eventDeepLink: (state: string, eventSlug: string) =>
      `${countryPrefix}/events/${state}/${eventSlug}`,
    advocacyToolkit: () => `${countryPrefix}/advocacy-toolkit`,
    creatorDefenseFund: () => `${countryPrefix}/creator-defense-fund`,
    press: () => `${countryPrefix}/press`,
    emailDeeplink: () => `${countryPrefix}/action/email`,
    polls: () => `${countryPrefix}/polls`,
    referrals: (params: Partial<{ pageNum: number; stateCode: string }> = {}) => {
      const { pageNum, stateCode } = params
      const shouldSuppressPageNum = (pageNum ?? 1) === 1
      const pageSuffix = shouldSuppressPageNum ? '' : `/${pageNum ?? 1}`
      if (stateCode) {
        return `${countryPrefix}/referrals/state/${stateCode.toLowerCase()}${pageSuffix}`
      }
      return `${countryPrefix}/referrals${pageSuffix}`
    },
    newmodeElectionAction: () => `${countryPrefix}/content/election`,
    newmodeDebankingAction: () => `${countryPrefix}/content/debanking`,
    newmodeMomentumAheadHouseRisingAction: () => `${countryPrefix}/content/houserising`,
    contentClarity: () => `${countryPrefix}/content/clarity`,
    contentGenius: () => `${countryPrefix}/content/genius`,
    ...RACES_ROUTES,
    localPolicy: (stateCode?: string) =>
      `${countryPrefix}/local-policy${stateCode ? `/${stateCode.toLowerCase()}` : ''}`,
    resubscribeSuccess: () => `${countryPrefix}/email/resubscribe-success`,
    dayOfActionLP: () => `${countryPrefix}/cryptodayofaction`,
  }
}

export const apiUrls = {
  dtsiPeopleByElectoralZone: ({
    electoralZone,
    stateCode,
    countryCode,
  }: {
    stateCode: string | null
    electoralZone: string
    countryCode: SupportedCountryCodes
  }) => {
    if (countryCode === SupportedCountryCodes.US && stateCode) {
      return `/api/public/dtsi/by-geography/usa/${stateCode}/${electoralZone}`
    }

    return `/api/public/dtsi/by-geography/${countryCode}/${electoralZone}`
  },
  swcCivicElectoralZoneByAddress: ({ address, placeId }: { address: string; placeId?: string }) => {
    const searchParams = new URLSearchParams()
    searchParams.set('address', address.trim())
    if (placeId) searchParams.set('placeId', placeId)
    return `/api/public/swc-civic/electoral-zone/by-address?${searchParams.toString()}`
  },
  swcCivicElectoralZoneByGeolocation: ({
    latitude,
    longitude,
  }: {
    latitude: number
    longitude: number
  }) => {
    const searchParams = new URLSearchParams()
    searchParams.set('latitude', latitude.toString())
    searchParams.set('longitude', longitude.toString())
    return `/api/public/swc-civic/electoral-zone/by-geolocation?${searchParams.toString()}`
  },
  totalDonations: () => '/api/public/total-donations',
  userPerformedUserActionTypes: ({ countryCode }: { countryCode: SupportedCountryCodes }) =>
    `/api/${countryCode}/identified-user/performed-user-action-types`,
  userFullProfileInfo: () => `/api/identified-user/full-profile-info`,
  detectWipedDatabase: () => `/api/identified-user/detect-wiped-database`,
  dtsiAllPeople: ({ countryCode }: { countryCode: SupportedCountryCodes }) =>
    `/api/public/dtsi/all-people/${countryCode}`,
  recentActivity: ({
    limit,
    countryCode,
    stateCode,
  }: {
    limit: number
    countryCode: string
    stateCode?: string
  }) => `/api/public/recent-activity/${limit}/${countryCode}${stateCode ? `/${stateCode}` : ''}`,
  homepageTopLevelMetrics: () => `/api/public/homepage/top-level-metrics`,
  unidentifiedUser: ({ sessionId }: { sessionId: string }) => `/api/unidentified-user/${sessionId}`,
  billVote: ({ slug, billId }: { slug: string; billId: string }) =>
    `/api/public/dtsi/bill-vote/${billId}/${slug}`,
  totalAdvocatesPerState: (countryCode: SupportedCountryCodes) =>
    `/api/public/advocates-map/${countryCode}/total-advocates-per-state`,
  advocatesCountByState: (stateCode: string) => `/api/public/state-advocates/${stateCode}`,
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
  electoralZoneRanking: ({
    countryCode,
    stateCode,
    electoralZone,
    filteredByState,
  }: {
    countryCode: SupportedCountryCodes
    stateCode: string
    electoralZone: string
    filteredByState?: boolean
  }) =>
    `/api/public/referrals/${countryCode}/${stateCode}/${electoralZone}${filteredByState ? '/by-state' : ''}`,
  dtsiRacesByCongressionalDistrict: ({
    administrativeArea,
    district,
  }: {
    administrativeArea: string
    district: number
  }) => `/api/public/dtsi/races/usa/${administrativeArea}/${district}`,
  petitions: ({ countryCode }: { countryCode: SupportedCountryCodes }) =>
    `/api/${countryCode}/public/petitions`,
  petitionBySlug: ({
    countryCode,
    petitionSlug,
  }: {
    countryCode: SupportedCountryCodes
    petitionSlug: string
  }) => `/api/${countryCode}/public/petitions/${petitionSlug}`,
}

export * from './externalUrls'
export * from './fullUrl'
