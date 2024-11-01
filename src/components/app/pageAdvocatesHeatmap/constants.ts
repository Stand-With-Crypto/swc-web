import { UserActionType } from '@prisma/client'

import {
  IconProps,
  JoinIcon,
  PrepareToVoteIcon,
  ViewKeyRacesIcon,
} from '@/components/app/pageAdvocatesHeatmap/advocateHeatmapIcons'

export const STATE_COORDS: Record<string, [number, number]> = {
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
}

export const ADVOCATES_HEATMAP_GEO_URL =
  'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/public/state-map-json-metadata-R1nrmLtd1Af1gWq0bFp1hWNjmAWJLn.json'

export const ADVOCATES_ACTIONS: Partial<
  Record<
    UserActionType,
    {
      icon: (args: IconProps) => JSX.Element
      label: string
      labelMobile: string
      labelActionTooltip: string
    }
  >
> = {
  // removed call and email for the voting day
  // CALL: {
  //   icon: CallIcon,
  //   label: 'Call made to congress',
  //   labelMobile: 'called',
  //   labelActionTooltip: 'called their rep',
  // },
  // EMAIL: {
  //   icon: EmailIcon,
  //   label: 'Email sent to congress',
  //   labelMobile: 'emailed',
  //   labelActionTooltip: 'emailed their rep',
  // },
  OPT_IN: {
    icon: JoinIcon,
    label: 'New member joined',
    labelMobile: 'joined',
    labelActionTooltip: 'joined SWC',
  },
  // removed call and email for the voting day
  // VOTER_REGISTRATION: {
  //   icon: VoterRegIcon,
  //   label: 'Checked voter registration',
  //   labelMobile: 'checked voter reg.',
  //   labelActionTooltip: 'checked voter registration',
  // },
  // VOTER_ATTESTATION: {
  //   icon: VoterAttestationIcon,
  //   label: 'Pledged to vote',
  //   labelMobile: 'pledged to vote',
  //   labelActionTooltip: 'pledged to vote',
  // },
  VIEW_KEY_RACES: {
    icon: ViewKeyRacesIcon,
    label: 'Researched politician scores',
    labelMobile: 'researched',
    labelActionTooltip: 'researched politician scores',
  },
  VOTING_INFORMATION_RESEARCHED: {
    icon: PrepareToVoteIcon,
    label: 'Prepared to vote',
    labelMobile: 'prepared',
    labelActionTooltip: 'prepared to vote',
  },
}
