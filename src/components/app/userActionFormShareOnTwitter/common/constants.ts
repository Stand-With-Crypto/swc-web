import { CommonShareSection } from '@/components/app/userActionFormShareOnTwitter/common/sections/share'
import { CommonSuccessSection } from '@/components/app/userActionFormShareOnTwitter/common/sections/success'
import { UserActionTweetCountryConfig } from '@/components/app/userActionFormShareOnTwitter/common/types'

export enum SectionNames {
  SHARE = 'Share',
  SUCCESS = 'Success',
}

export const ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER = 'User Action Form Share on Twitter'

export const USER_ACTION_TWEET_DEFAULT_CONTENT: UserActionTweetCountryConfig = {
  sections: Object.values(SectionNames),
  initialSection: SectionNames.SHARE,
  analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER,
  sectionComponents: {
    [SectionNames.SHARE]: CommonShareSection,
    [SectionNames.SUCCESS]: CommonSuccessSection,
  },
  meta: {
    title: 'Follow us on X',
    subtitle: 'Follow Stand With Crypto and stay up to date on crypto policy',
    followUrl: 'https://x.com/standwithcrypto',
    followText: 'Follow @StandWithCrypto',
    benefits: [
      'Helping influence policymakers and decision makers',
      'Staying informed on everything crypto policy related',
      'Joining a community of like-minded individuals focused on keeping crypto in America',
    ],
  },
}
