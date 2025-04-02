export enum GBEmailActiveActions {
  TWEET = 'TWEET',
  VIEW_KEY_RACES = 'VIEW_KEY_RACES',
  VOTER_ATTESTATION = 'VOTER_ATTESTATION',
}

// Keys in this object are still type enforced, we don't want to use the prisma enum due to errors on dev environment
export const GB_ACTIONS_METADATA_BY_TYPE: Record<
  GBEmailActiveActions,
  {
    image: string
    text: string
    subtext: string
    buttonLabel: string
    buttonHref: string
  }
> = {
  [GBEmailActiveActions.TWEET]: {
    image: `/gb/actionTypeIcons/tweet.png`,
    text: 'Tweet about crypto',
    subtext: 'Share your thoughts on crypto with the world.',
    buttonLabel: 'Tweet',
    buttonHref: `/gb/action/tweet`,
  },
  [GBEmailActiveActions.VIEW_KEY_RACES]: {
    image: `/gb/actionTypeIcons/view-key-races.png`,
    text: 'View key races',
    subtext: 'See the key races for the upcoming election.',
    buttonLabel: 'View key races',
    buttonHref: `/gb/action/view-key-races`,
  },
  [GBEmailActiveActions.VOTER_ATTESTATION]: {
    image: `/gb/actionTypeIcons/voter-attestation.png`,
    text: 'Voter attestation',
    subtext: 'Verify your voter registration.',
    buttonLabel: 'Voter attestation',
    buttonHref: `/gb/action/voter-attestation`,
  },
}
export const GB_SOCIAL_MEDIA_URL = {
  twitter: 'https://x.com/StandWCrypto_UK',
  linkedin: 'https://www.linkedin.com/company/standwithcryptouk',
}

export interface GBEmailTemplateProps {
  previewText?: string
  session?: {
    userId?: string
    sessionId?: string
  } | null
}
