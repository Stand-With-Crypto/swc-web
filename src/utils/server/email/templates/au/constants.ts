export enum AUEmailActiveActions {
  TWEET = 'TWEET',
  VIEW_KEY_RACES = 'VIEW_KEY_RACES',
  VOTER_ATTESTATION = 'VOTER_ATTESTATION',
}

// Keys in this object are still type enforced, we don't want to use the prisma enum due to errors on dev environment
export const AU_ACTIONS_METADATA_BY_TYPE: Record<
  AUEmailActiveActions,
  {
    image: string
    text: string
    subtext: string
    buttonLabel: string
    buttonHref: string
  }
> = {
  [AUEmailActiveActions.TWEET]: {
    image: `/au/actionTypeIcons/tweet.png`,
    text: 'Tweet about crypto',
    subtext: 'Share your thoughts on crypto with the world.',
    buttonLabel: 'Tweet',
    buttonHref: `/au/action/tweet`,
  },
  [AUEmailActiveActions.VIEW_KEY_RACES]: {
    image: `/au/actionTypeIcons/view-key-races.png`,
    text: 'View key races',
    subtext: 'See the key races for the upcoming election.',
    buttonLabel: 'View key races',
    buttonHref: `/au/action/view-key-races`,
  },
  [AUEmailActiveActions.VOTER_ATTESTATION]: {
    image: `/au/actionTypeIcons/voter-attestation.png`,
    text: 'Voter attestation',
    subtext: 'Verify your voter registration.',
    buttonLabel: 'Voter attestation',
    buttonHref: `/au/action/voter-attestation`,
  },
}

export const AU_SOCIAL_MEDIA_URL = {
  twitter: 'https://x.com/StandWCrypto_AU',
  linkedin: 'https://www.linkedin.com/company/stand-with-crypto-australia',
}

export interface AUEmailTemplateProps {
  previewText?: string
  session?: {
    userId?: string
    sessionId?: string
  } | null
}
