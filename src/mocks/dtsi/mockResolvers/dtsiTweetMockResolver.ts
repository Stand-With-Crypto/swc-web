import { DTSI_TweetResolvers } from '@/data/dtsi/generated'
import { COMPLEX_TWEET_INFO } from '@/mocks/misc/complexTweetInfo'

export const dtsiTweetMockResolver = (): Partial<DTSI_TweetResolvers> => ({
  text: () => COMPLEX_TWEET_INFO.text,
  entities: () => COMPLEX_TWEET_INFO.entities,
})
