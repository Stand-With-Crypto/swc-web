import { FormattedUserTweet, TweetEntityOptionsWithType } from '@/types/twitter'
import twemoji from 'twemoji'
import {
  DTSIStanceDetailsStanceProp,
  DTSIStanceDetailsTweetProp,
  IStanceDetailsProps,
} from '@/components/app/dtsiStanceDetails/types'
import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { MaybeNextImg, NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import {
  dtsiPersonFullName,
  getDTSIPersonProfilePictureUrlDimensions,
} from '@/utils/dtsi/dtsiPersonUtils'
import { dtsiTweetUrl } from '@/utils/dtsi/dtsiTweetUtils'
import { cn } from '@/utils/web/cn'
import sanitizeHtml from 'sanitize-html'

// @ts-ignore
import { parse as twemojiParser } from 'twemoji-parser'
import { InitialsAvatar } from '@/components/ui/initialsAvatar'

export function getEmojiIndexes(tweet: DTSIStanceDetailsTweetProp['tweet']) {
  // define a regular expression to match all Unicode emoji characters

  // use matchAll() method to find all matches of the emoji regex in the string
  const matches: Array<{ indices: number[] }> = twemojiParser(tweet.text)
  // map the matches to an array of their indexes
  const indexes = matches.map(match => match.indices[0])

  // return the indexes to match the fact that twitter api start/end doesnt account for emoji length
  const indexesWithOffsite = indexes.map((indexInStr, indexInArray) => indexInStr - indexInArray)
  return indexesWithOffsite
}

function modifyEntitiesToAccountForEmojisOffset(
  emojiIndexes: number[],
  entities: TweetEntityOptionsWithType[],
) {
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

function TweetLink(props: React.ComponentPropsWithoutRef<typeof ExternalLink>) {
  return (
    <ExternalLink
      className="font-semibold text-blue-400"
      style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}
      rel="nofollow"
      {...props}
    />
  )
}

function TweetBody({ tweet }: { tweet: DTSIStanceDetailsTweetProp['tweet'] }) {
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
                  __html: sanitizeHtml(twemoji.parse(text), {
                    allowedTags: ['b', 'i', 'em', 'strong', 'img'],
                    allowedSchemes: ['https'],
                    allowedAttributes: {
                      // these are the tags that twemoji adds to the inline emoji images
                      img: ['src', 'alt', 'class', 'draggable'],
                    },
                  }),
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

export function DTSIStanceDetailsTweet({
  stance,
  person,
  locale,
}: Omit<IStanceDetailsProps, 'stance'> & {
  stance: DTSIStanceDetailsStanceProp<DTSIStanceDetailsTweetProp>
}) {
  const isOwnTweet = stance.tweet.twitterAccount.personId === person.id
  return (
    <article className="rounded-lg text-gray-800">
      <div
        className={cn('mb-3 flex justify-between pb-3', isOwnTweet || 'border-b border-gray-300')}
      >
        {isOwnTweet ? (
          <div className="flex items-center gap-2">
            {person.profilePictureUrl ? (
              <div className="h-12 w-12 overflow-hidden rounded-full">
                <MaybeNextImg
                  sizes="48px"
                  alt={`profile picture of ${dtsiPersonFullName(person)}`}
                  {...(getDTSIPersonProfilePictureUrlDimensions(person) || {})}
                  src={person.profilePictureUrl}
                />
              </div>
            ) : (
              <div>
                <InitialsAvatar
                  size={48}
                  firstInitial={(person.firstNickname || person.firstName).slice(0, 1)}
                  lastInitial={person.lastName.slice(0, 1)}
                />
              </div>
            )}
            <div>
              <p className="text-sm font-bold">{dtsiPersonFullName(person)}</p>
              <p className="text-sm text-muted-foreground">
                @{stance.tweet.twitterAccount.username}
              </p>
            </div>
          </div>
        ) : (
          <div className="italic text-gray-700">
            A tweet from @{stance.tweet.twitterAccount.username} referenced{' '}
            {dtsiPersonFullName(person)}
          </div>
        )}
        <NextImage alt="x.com logo" src={'/misc/xDotComLogo.svg'} width={24} height={24} />
      </div>

      <div className="mb-3 whitespace-pre-line " style={{ lineHeight: 1.2 }}>
        <TweetBody tweet={stance.tweet} />
      </div>
      {stance.tweet.tweetMedia.length ? (
        <div className="mx-auto my-3 flex justify-center" style={{ maxWidth: '500px' }}>
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
        <ExternalLink
          className="text-sm underline"
          href={dtsiTweetUrl(stance.tweet, stance.tweet.twitterAccount)}
        >
          @{stance.tweet.twitterAccount.username}{' '}
          <FormattedDatetime
            dateStyle="medium"
            date={new Date(stance.tweet.datetimeCreatedOnTwitter)}
            locale={locale}
          />{' '}
          on X
        </ExternalLink>
      </div>
    </article>
  )
}
