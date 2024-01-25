import { DTSI_TweetResolvers } from '@/data/dtsi/generated'
import { COMPLEX_TWEET_INFO } from '@/mocks/misc/complexTweetInfo'

export function dtsiTweetMockResolver(): Partial<DTSI_TweetResolvers> {
  return {
    text: () => COMPLEX_TWEET_INFO.text,
    entities: () => COMPLEX_TWEET_INFO.entities,
  }
}
