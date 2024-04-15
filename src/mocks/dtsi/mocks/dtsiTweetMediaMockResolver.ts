import { DTSI_TweetMedia } from '@/data/dtsi/generated'
import { COMPLEX_TWEET_INFO } from '@/mocks/misc/complexTweetInfo'

export const dtsiTweetMediaMockResolver = (): Partial<DTSI_TweetMedia> => ({
  width: COMPLEX_TWEET_INFO.media[0].width,
  height: COMPLEX_TWEET_INFO.media[0].height,
  url: COMPLEX_TWEET_INFO.media[0].url,
})
