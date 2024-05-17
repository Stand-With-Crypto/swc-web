import { UserActionTweetAtPersonCampaignName } from '@/utils/shared/userActionCampaigns'

export const ANALYTICS_NAME_USER_ACTION_FORM_TWEET_AT_PERSON = 'User Action Form Tweet At Person'

export const ANALYTICS_NAME_USER_ACTION_FORM_PIZZA_DAY_TWEET_AT_PERSON_CAMPAIGN =
  'User Action Form Pizza Day 2024/05/22 Tweet At Person Campaign'

export enum TweetAtPersonSectionNames {
  ONBOARDING = 'Onboarding',
  TWEET = 'Tweet',
  SUCCESS = 'Success',
}

type Message = 'title' | 'analyticsName'

export const CAMPAIGN_METADATA: Record<
  UserActionTweetAtPersonCampaignName,
  Record<Message, string>
> = {
  [UserActionTweetAtPersonCampaignName.DEFAULT]: {
    title: 'Tweet at your Congress Person',
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_TWEET_AT_PERSON,
  },
  [UserActionTweetAtPersonCampaignName['2024_05_22_PIZZA_DAY']]: {
    title: 'Pizza Day - Tweet at your Congress Person',
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_PIZZA_DAY_TWEET_AT_PERSON_CAMPAIGN,
  },
}
