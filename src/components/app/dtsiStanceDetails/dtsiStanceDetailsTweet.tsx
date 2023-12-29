import { FormattedUserTweet, TweetEntityOptionsWithType } from '@/types/twitter'
import twemoji from 'twemoji'
// @ts-ignore
import { parse as twemojiParser } from 'twemoji-parser'
import { ExternalLink } from '@/components/ui/link'
import {
  DTSIStanceDetailsPersonProp,
  DTSIStanceDetailsStanceProp,
  DTSIStanceDetailsTweetProp,
} from '@/components/app/dtsiStanceDetails/types'
import { DTSI_Person } from '@/data/dtsi/generated'
import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { Quote, Twitter } from 'lucide-react'
import { cn } from '@/utils/web/cn'
import { NextImage } from '@/components/ui/image'
import { format } from 'date-fns'
import { dtsiTweetUrl } from '@/utils/dtsi/dtsiTweetUtils'

export const getEmojiIndexes = (tweet: DTSIStanceDetailsTweetProp['tweet']) => {
  // define a regular expression to match all Unicode emoji characters

  // use matchAll() method to find all matches of the emoji regex in the string
  const matches: Array<{ indices: number[] }> = twemojiParser(tweet.text)
  // map the matches to an array of their indexes
  const indexes = matches.map(match => match.indices[0])

  // return the indexes to match the fact that twitter api start/end doesnt account for emoji length
  const indexesWithOffsite = indexes.map((indexInStr, indexInArray) => indexInStr - indexInArray)
  return indexesWithOffsite
}

const modifyEntitiesToAccountForEmojisOffset = (
  emojiIndexes: number[],
  entities: TweetEntityOptionsWithType[],
) => {
  return entities.map(entity => {
    const relevantEmojis = emojiIndexes.filter(index => index < entity.start)
    return {
      ...entity,
      start: entity.start + relevantEmojis.length,
      end: entity.end + relevantEmojis.length,
    }
  })
}

function addEntities(
  tweet: DTSIStanceDetailsTweetProp['tweet'],
  emojiIndexes: number[],
  result: TweetEntityOptionsWithType[],
  entities: TweetEntityOptionsWithType[] = [],
) {
  for (const entity of modifyEntitiesToAccountForEmojisOffset(emojiIndexes, entities)) {
    for (let i = 0; i < result.length; i++) {
      const item = result[i]
      if (entity.start < item.start || entity.end > item.end) {
        continue
      }

      const items = [entity] as TweetEntityOptionsWithType[]

      if (item.start < entity.start) {
        items.unshift({
          start: item.start,
          end: entity.start,
          type: 'text',
        })
      }
      if (item.end > entity.end) {
        items.push({
          start: entity.end,
          end: item.end,
          type: 'text',
        })
      }

      result.splice(i, 1, ...items)
      break // Break out of the loop to avoid iterating over the new items
    }
  }
}

function getEntities(tweet: DTSIStanceDetailsTweetProp['tweet']) {
  const result: TweetEntityOptionsWithType[] = [{ start: 0, end: tweet.text.length, type: 'text' }]

  const emojiIndexes = getEmojiIndexes(tweet)
  const entities = tweet.entities as FormattedUserTweet['entities']
  addEntities(tweet, emojiIndexes, result, entities.urls?.map(x => ({ ...x, type: 'urls' })))
  addEntities(
    tweet,
    emojiIndexes,
    result,
    entities.hashtags?.map(x => ({ ...x, type: 'hashtags' })),
  )
  addEntities(
    tweet,
    emojiIndexes,
    result,
    entities.cashtags?.map(x => ({ ...x, type: 'cashtags' })),
  )
  addEntities(
    tweet,
    emojiIndexes,
    result,
    entities.mentions?.map(x => ({ ...x, type: 'mentions' })),
  )
  return result
}

const TweetLink: React.FC<React.ComponentPropsWithoutRef<typeof ExternalLink>> = props => (
  <ExternalLink
    className="font-semibold text-blue-400"
    style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}
    rel="nofollow"
    {...props}
  />
)

const TweetBody: React.FC<{ tweet: DTSIStanceDetailsTweetProp['tweet'] }> = ({ tweet }) => {
  const entities = getEntities(tweet)

  return (
    <div>
      {entities.map((item, i) => {
        const text = tweet.text.slice(item.start, item.end)

        switch (item.type) {
          case 'text':
            return (
              <span
                key={i}
                dangerouslySetInnerHTML={{
                  __html: twemoji.parse(text),
                }}
              />
            )
          case 'urls':
            return (
              <TweetLink href={item.url} key={i}>
                {item.display_url}
              </TweetLink>
            )
          case 'hashtags':
            return (
              <span className="font-semibold text-blue-400" key={i}>
                {text}
              </span>
            )
          case 'cashtags':
            return (
              <span className="font-semibold text-blue-400" key={i}>
                {text}
              </span>
            )
          case 'mentions':
            return (
              <span className="font-semibold text-blue-400" key={i}>
                {text}
              </span>
            )
        }
      })}
    </div>
  )
}

export interface StanceDetailsTweetProps {
  person: DTSIStanceDetailsPersonProp
  stance: DTSIStanceDetailsStanceProp<DTSIStanceDetailsTweetProp>
}

export const DTSIStanceDetailsTweet: React.FC<StanceDetailsTweetProps> = ({ stance, person }) => {
  console.log(stance.tweet.twitterAccount.personId, person.id)
  return (
    <article className="rounded-lg bg-white p-4 text-gray-800 lg:text-xl">
      {stance.tweet.twitterAccount.personId === person.id ? (
        <div className="flex justify-between">
          <div className="flex flex-1 items-center">
            <div className="mr-2" style={{ flex: '0 0 50px' }}>
              <DTSIAvatar person={person} size={50} />
            </div>
            <div className="flex-1 leading-tight" style={{ fontSize: '15px' }}>
              <div className="font-bold">{dtsiPersonFullName(person)}</div>
              <div style={{ color: 'rgb(83, 100, 113)' }}>
                @{stance.tweet.twitterAccount.username}
              </div>
            </div>
          </div>
          <div>
            <Twitter className="h-6 w-6" />
          </div>
        </div>
      ) : (
        <div className="mb-3 flex items-center border-b pb-3">
          <div className="mr-3 w-10 shrink-0">
            <Quote size={40} />
          </div>
          <div>
            A tweet from{' '}
            <span className="font-semibold text-blue-400">
              @{stance.tweet.twitterAccount.username}
            </span>{' '}
            referenced {dtsiPersonFullName(person)}
          </div>
        </div>
      )}
      <div className="my-4 whitespace-pre-line " style={{ lineHeight: 1.2 }}>
        <TweetBody tweet={stance.tweet} />
      </div>
      {stance.tweet.tweetMedia.length ? (
        <div className="mx-auto my-4 flex justify-center" style={{ maxWidth: '500px' }}>
          {stance.tweet.tweetMedia.map(media => (
            <div
              className={cn(
                stance.tweet.tweetMedia.length > 1 || media.height! > media.width!
                  ? 'w-1/2'
                  : 'w-full',
              )}
              key={media.id}
            >
              <NextImage
                alt={`tweet image`}
                width={media.width!}
                height={media.height!}
                sizes="300px"
                src={media.url}
              />
            </div>
          ))}
        </div>
      ) : null}
      <div>
        {format(new Date(stance.tweet.datetimeCreatedOnTwitter), 'h:mm a · MMM d, yyyy')}
        {' · '}via Twitter
      </div>
      <div>
        <ExternalLink
          className="text-sm text-blue-400"
          href={dtsiTweetUrl(stance.tweet, stance.tweet.twitterAccount)}
        >
          View original tweet
        </ExternalLink>
      </div>
    </article>
  )
}
