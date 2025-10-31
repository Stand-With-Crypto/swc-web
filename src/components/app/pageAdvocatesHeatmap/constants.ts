import type { ReactNode } from 'react'
import type { ComposableMapProps } from 'react-simple-maps'
import { UserActionType } from '@prisma/client'

import {
  DonateIcon,
  EmailIcon,
  FollowOnLinkedInIcon,
  FollowOnXIcon,
  IconProps,
  JoinIcon,
} from '@/components/app/pageAdvocatesHeatmap/advocateHeatmapIcons'
import { AUStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import { CAProvinceOrTerritoryCode } from '@/utils/shared/stateMappings/caProvinceUtils'
import { GBRegion } from '@/utils/shared/stateMappings/gbCountryUtils'
import { USStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export type Coords = [number, number]

type USStateCoords = Partial<Record<USStateCode, Coords>>
type GBStateCoords = Partial<Record<GBRegion, Coords>>
type CAStateCoords = Partial<Record<CAProvinceOrTerritoryCode, Coords>>
type AUStateCoords = Partial<Record<AUStateCode, Coords>>

interface RegionCoords {
  [SupportedCountryCodes.US]: USStateCoords
  [SupportedCountryCodes.GB]: GBStateCoords
  [SupportedCountryCodes.CA]: CAStateCoords
  [SupportedCountryCodes.AU]: AUStateCoords
}

export type AreaCoordinates = USStateCoords | GBStateCoords | CAStateCoords | AUStateCoords
export type AreaCoordinatesKey =
  | keyof USStateCoords
  | keyof GBStateCoords
  | keyof CAStateCoords
  | keyof AUStateCoords

export const AREAS_WITH_SINGLE_MARKER: AreaCoordinatesKey[] = ['ACT', 'London', 'NB', 'NS', 'PE']

// Coordinates format: [longitude, latitude]
export const AREA_COORDS_BY_COUNTRY_CODE: Partial<RegionCoords> = {
  [SupportedCountryCodes.US]: {
    AL: [-86.9023, 32.3182],
    AK: [-152.4044, 61.3707],
    AZ: [-111.4312, 34.0489],
    AR: [-92.3731, 34.9697],
    CA: [-119.6816, 36.1162],
    CO: [-105.3111, 39.0598],
    CT: [-72.7554, 41.5978],
    DE: [-75.5071, 39.3185],
    FL: [-81.5158, 27.7663],
    GA: [-83.6431, 33.0406],
    HI: [-157.4983, 21.0943],
    ID: [-114.4788, 44.2405],
    IL: [-89.3985, 40.3495],
    IN: [-86.2583, 39.8494],
    IA: [-93.2105, 42.0115],
    KS: [-96.7265, 38.5266],
    KY: [-84.6701, 37.6681],
    LA: [-91.9623, 31.1695],
    ME: [-69.3819, 44.6939],
    MD: [-76.8021, 39.0639],
    MA: [-71.5301, 42.2302],
    MI: [-84.5361, 43.3266],
    MN: [-93.9002, 45.6945],
    MS: [-89.6787, 32.7416],
    MO: [-92.2884, 38.4561],
    MT: [-110.4544, 46.9219],
    NE: [-99.9018, 41.1254],
    NV: [-117.0554, 38.3135],
    NH: [-71.5639, 43.4525],
    NJ: [-74.521, 40.2989],
    NM: [-106.2485, 34.8405],
    NY: [-74.9481, 42.1657],
    NC: [-79.8064, 35.6301],
    ND: [-99.784, 47.5289],
    OH: [-82.7649, 40.3888],
    OK: [-96.9289, 35.5653],
    OR: [-122.0709, 44.572],
    PA: [-77.2098, 40.5908],
    RI: [-71.5118, 41.6809],
    SC: [-80.945, 33.8569],
    SD: [-99.4388, 44.2998],
    TN: [-86.6923, 35.7478],
    TX: [-99.9018, 31.0545],
    UT: [-111.6703, 40.15],
    VT: [-72.7107, 44.0459],
    VA: [-78.6569, 37.7693],
    WA: [-121.4905, 47.4009],
    WV: [-80.9545, 38.4912],
    WI: [-89.6165, 44.2685],
    WY: [-107.3025, 42.756],
    DC: [-77.026, 38.8964],
  },
  [SupportedCountryCodes.GB]: {
    'East Midlands England': [-1.77, 53.2],
    'East of England': [0.4, 52.8],
    'North East England': [-2, 55.4],
    'North West England': [-3.5, 54.2],
    'South East England': [-1.5, 51.64],
    'South West England': [-2.7, 51.56],
    'West Midlands England': [-2.9, 52.8],
    'Yorkshire and The Humber': [-1.9, 54.35],
    Wales: [-4.26, 52.69],
    'Northern Ireland': [-7.2, 55],
    London: [0.2, 51.9],
    Scotland: [-4.5, 56.8],
  },
  [SupportedCountryCodes.CA]: {
    AB: [-117.5, 56.0],
    BC: [-127.5, 55.0],
    MB: [-100.5, 56.0],
    NB: [-66.5, 48.5],
    NL: [-61.0, 57.5],
    NS: [-64.0, 46.0],
    NT: [-127.0, 65.5],
    NU: [-95.0, 70.0],
    ON: [-88.0, 53.0],
    PE: [-62.0, 49.5],
    QC: [-73.5, 54.5],
    SK: [-108.5, 56.0],
    YT: [-142.0, 64.5],
  },
  [SupportedCountryCodes.AU]: {
    ACT: [149.1, -35.3],
    NSW: [150.0, -31.5],
    NT: [131.5, -12.0],
    QLD: [151.5, -25.0],
    SA: [136.5, -34.0],
    TAS: [146.0, -41.5],
    VIC: [144.0, -37.0],
    WA: [115.5, -30.5],
  },
}

export interface MapProjectionConfig {
  geoPropertyStateNameKey: string
  markerOffset?: number
  markerSize?: number
  projection?: ComposableMapProps['projection']
  projectionConfig?: ComposableMapProps['projectionConfig']
  projectionUrl: string
  shouldRandomizeMarkerOffsets?: boolean
}

export const MAP_PROJECTION_CONFIG: Partial<Record<SupportedCountryCodes, MapProjectionConfig>> = {
  [SupportedCountryCodes.US]: {
    projectionUrl:
      'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/public/state-map-json-metadata-R1nrmLtd1Af1gWq0bFp1hWNjmAWJLn.json',
    projection: 'geoAlbersUsa',
    projectionConfig: {
      scale: 1100,
    },
    markerOffset: 1.2,
    markerSize: 40,
    geoPropertyStateNameKey: 'name',
  },
  [SupportedCountryCodes.GB]: {
    projectionUrl:
      'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/public/NUTS_Level_1_2018_United_Kingdom_2022_simplified.json',
    projection: 'geoMercator',
    projectionConfig: {
      center: [-3.9, 56.0],
      scale: 1600,
    },
    markerOffset: 0.5,
    markerSize: 30,
    geoPropertyStateNameKey: 'nuts118nm',
  },
  [SupportedCountryCodes.CA]: {
    projectionUrl:
      'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/public/state-map-json-metadata-ca.topojson',
    // Mercator projection causes distortion in Canada, so using Conic Conformal instead (this is the official projection for Canada maps)
    projection: 'geoConicConformal',
    projectionConfig: {
      center: [8.0, 64.5],
      parallels: [49, 77],
      scale: 770,
      rotate: [96, 0, 0],
    },
    markerOffset: 2,
    markerSize: 30,
    geoPropertyStateNameKey: 'name',
  },
  [SupportedCountryCodes.AU]: {
    projectionUrl:
      'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/public/state-map-json-metadata-au.topojson',
    projection: 'geoMercator',
    projectionConfig: {
      center: [134.5, -27.5],
      scale: 745,
    },
    markerOffset: 2.6,
    markerSize: 28,
    geoPropertyStateNameKey: 'name',
    shouldRandomizeMarkerOffsets: true,
  },
}

export interface AdvocateHeatmapAction {
  icon: (args: IconProps) => ReactNode
  label: string
  labelMobile: string
  labelActionTooltip: (extraText?: string) => string
}

export const ADVOCATES_ACTIONS_BY_COUNTRY_CODE: Partial<
  Record<SupportedCountryCodes, Partial<Record<UserActionType, AdvocateHeatmapAction>>>
> = {
  [SupportedCountryCodes.US]: {
    // removed call and email for the voting day
    // CALL: {
    //   icon: CallIcon,
    //   label: 'Call made to congress',
    //   labelMobile: 'called',
    //   labelActionTooltip: () => 'called their rep',
    // },
    OPT_IN: {
      icon: JoinIcon,
      label: 'New member joined',
      labelMobile: 'joined',
      labelActionTooltip: () => 'joined SWC',
    },
    EMAIL: {
      icon: EmailIcon,
      label: 'Email sent to senate',
      labelMobile: 'emailed',
      labelActionTooltip: () => 'emailed their rep',
    },
    TWEET: {
      icon: FollowOnXIcon,
      label: 'Followed SWC on X',
      labelMobile: 'Followed SWC on X',
      labelActionTooltip: () => 'followed SWC on X',
    },
    // VOTING_DAY: {
    //   icon: VotedIcon,
    //   label: 'Claimed "I Voted" NFT',
    //   labelMobile: 'Claimed "I Voted" NFT',
    //   labelActionTooltip: () => 'claimed the "I Voted" NFT',
    // },
    DONATION: {
      icon: DonateIcon,
      label: 'Donated to SWC',
      labelMobile: 'Donated to SWC',
      labelActionTooltip: extraText =>
        extraText ? `donated ${extraText} to SWC` : 'donated to SWC',
    },
    // removed call and email for the voting day
    // VOTER_REGISTRATION: {
    //   icon: VoterRegIcon,
    //   label: 'Checked voter registration',
    //   labelMobile: 'checked voter reg.',
    //   labelActionTooltip: () => 'checked voter registration',
    // },
    // VOTER_ATTESTATION: {
    //   icon: VoterAttestationIcon,
    //   label: 'Pledged to vote',
    //   labelMobile: 'pledged to vote',
    //   labelActionTooltip: () => 'pledged to vote',
    // },
    // VOTING_INFORMATION_RESEARCHED: {
    //   icon: PrepareToVoteIcon,
    //   label: 'Prepared to vote',
    //   labelMobile: 'prepared',
    //   labelActionTooltip: () => 'prepared to vote',
    // },
  },
  [SupportedCountryCodes.GB]: {
    OPT_IN: {
      icon: JoinIcon,
      label: 'New member joined',
      labelMobile: 'joined',
      labelActionTooltip: () => 'joined SWC',
    },
    EMAIL: {
      icon: EmailIcon,
      label: 'Email sent to MP',
      labelMobile: 'emailed',
      labelActionTooltip: () => 'emailed their rep',
    },
    TWEET: {
      icon: FollowOnXIcon,
      label: 'Followed SWC on X',
      labelMobile: 'Followed SWC on X',
      labelActionTooltip: () => 'followed SWC on X',
    },
    LINKEDIN: {
      icon: FollowOnLinkedInIcon,
      label: 'Followed SWC on LinkedIn',
      labelMobile: 'Followed SWC on LinkedIn',
      labelActionTooltip: () => 'followed SWC on LinkedIn',
    },
  },
  [SupportedCountryCodes.CA]: {
    OPT_IN: {
      icon: JoinIcon,
      label: 'New member joined',
      labelMobile: 'joined',
      labelActionTooltip: () => 'joined SWC',
    },
    EMAIL: {
      icon: EmailIcon,
      label: 'Email sent to MP',
      labelMobile: 'emailed',
      labelActionTooltip: () => 'emailed their rep',
    },
    TWEET: {
      icon: FollowOnXIcon,
      label: 'Followed SWC on X',
      labelMobile: 'Followed SWC on X',
      labelActionTooltip: () => 'followed SWC on X',
    },
    LINKEDIN: {
      icon: FollowOnLinkedInIcon,
      label: 'Followed SWC on LinkedIn',
      labelMobile: 'Followed SWC on LinkedIn',
      labelActionTooltip: () => 'followed SWC on LinkedIn',
    },
  },
  [SupportedCountryCodes.AU]: {
    OPT_IN: {
      icon: JoinIcon,
      label: 'New member joined',
      labelMobile: 'joined',
      labelActionTooltip: () => 'joined SWC',
    },
    EMAIL: {
      icon: EmailIcon,
      label: 'Email sent to MP',
      labelMobile: 'emailed',
      labelActionTooltip: () => 'emailed their rep',
    },
    TWEET: {
      icon: FollowOnXIcon,
      label: 'Followed SWC on X',
      labelMobile: 'Followed SWC on X',
      labelActionTooltip: () => 'followed SWC on X',
    },
    LINKEDIN: {
      icon: FollowOnLinkedInIcon,
      label: 'Followed SWC on LinkedIn',
      labelMobile: 'Followed SWC on LinkedIn',
      labelActionTooltip: () => 'followed SWC on LinkedIn',
    },
  },
}
