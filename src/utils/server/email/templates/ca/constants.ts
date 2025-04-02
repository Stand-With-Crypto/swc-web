export enum CAEmailActiveActions {
  TWEET = 'TWEET',
  VIEW_KEY_RACES = 'VIEW_KEY_RACES',
  VOTER_ATTESTATION = 'VOTER_ATTESTATION',
}

// Keys in this object are still type enforced, we don't want to use the prisma enum due to errors on dev environment
export const CA_ACTIONS_METADATA_BY_TYPE: Record<
  CAEmailActiveActions,
  {
    image: string
    text: string
    subtext: string
    buttonLabel: string
    buttonHref: string
  }
> = {
  [CAEmailActiveActions.TWEET]: {
    image: `/ca/actionTypeIcons/tweet.png`,
    text: 'Tweet about crypto',
    subtext: 'Share your thoughts on crypto with the world.',
    buttonLabel: 'Tweet',
    buttonHref: `/ca/action/tweet`,
  },
  [CAEmailActiveActions.VIEW_KEY_RACES]: {
    image: `/ca/actionTypeIcons/view-key-races.png`,
    text: 'View key races',
    subtext: 'See the key races for the upcoming election.',
    buttonLabel: 'View key races',
    buttonHref: `/ca/action/view-key-races`,
  },
  [CAEmailActiveActions.VOTER_ATTESTATION]: {
    image: `/ca/actionTypeIcons/voter-attestation.png`,
    text: 'Voter attestation',
    subtext: 'Verify your voter registration.',
    buttonLabel: 'Voter attestation',
    buttonHref: `/ca/action/voter-attestation`,
  },
}

export const CA_SOCIAL_MEDIA_URL = {
  twitter: 'https://x.com/StandWCrypto_CA',
  linkedin: 'https://www.linkedin.com/company/stand-with-crypto-canada',
}

export interface CAEmailTemplateProps {
  previewText?: string
  session?: {
    userId?: string
    sessionId?: string
  } | null
}
