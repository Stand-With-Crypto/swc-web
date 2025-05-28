import {
  TweetEntityAnnotationsV2,
  TweetEntityHashtagV2,
  TweetEntityMentionV2,
  TweetEntityUrlV2,
} from 'twitter-api-v2'

type TweetMedia =
  | {
      media_key: string
      width: number
      height: number

      url: string
      type: 'photo'
    }
  | {
      media_key: string
      width: number
      height: number

      preview_image_url: string
      type: 'animated_gif'
    }
  | {
      media_key: string
      width: number
      height: number

      preview_image_url: 'https://pbs.twimg.com/amplify_video_thumb/1425263184085233674/img/s5V15f3C1XtYGTMR.jpg'
      type: 'video'
      duration_ms: 105405
    }

interface TweetEntryTextEntity {
  start: number
  end: number
}

export type TweetEntityOptionsWithType =
  | (TweetEntryTextEntity & { type: 'text' })
  | (TweetEntityUrlV2 & { type: 'urls' })
  | (TweetEntityHashtagV2 & { type: 'hashtags' })
  | (TweetEntityHashtagV2 & { type: 'cashtags' })
  | (TweetEntityMentionV2 & { type: 'mentions' })

export interface FormattedUserTweet {
  id: string
  text: string
  created_at: string
  author_id: string
  media: Array<TweetMedia>
  entities: {
    annotations?: TweetEntityAnnotationsV2[]
    urls?: TweetEntityUrlV2[]
    hashtags?: TweetEntityHashtagV2[]
    cashtags?: TweetEntityHashtagV2[]
    mentions?: TweetEntityMentionV2[]
  }
}
