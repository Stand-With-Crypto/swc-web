export enum GBEmailActiveActions {
  TWEET = 'TWEET',
  REFER = 'REFER',
  VIEW_KEY_RACES = 'VIEW_KEY_RACES',
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
    buttonHref: `/gb/action/share`,
  },
  [GBEmailActiveActions.REFER]: {
    image: `/gb/actionTypeIcons/refer.png`,
    text: 'Refer a friend',
    subtext: 'Refer a friend to Stand With Crypto.',
    buttonLabel: 'Refer a friend',
    buttonHref: `/gb/action/refer`,
  },
  [GBEmailActiveActions.VIEW_KEY_RACES]: {
    image: `/gb/actionTypeIcons/votingResearched.png`,
    text: 'View key races',
    subtext: 'See the key races for the upcoming election.',
    buttonLabel: 'View key races',
    buttonHref: `/gb/races`,
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
