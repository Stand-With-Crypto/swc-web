'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { useInView } from 'motion/react'

import { EmptyList } from '@/components/app/pagePress/EmptyList'
import { NextImage } from '@/components/ui/image'
import { Spinner } from '@/components/ui/spinner'
import { TrackedExternalLink } from '@/components/ui/trackedExternalLink'
import { TrackedInternalLink } from '@/components/ui/trackedInternalLink'
import { getNewsList, NormalizedNews } from '@/utils/server/builder/models/data/news'
import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface NewsListProps {
  initialNews: NormalizedNews[]
  countryCode: SupportedCountryCodes
}

const NEWS_LIST_LIMIT = 10

export function NewsList({ initialNews, countryCode }: NewsListProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [offset, setOffset] = useState(initialNews.length < NEWS_LIST_LIMIT ? -1 : 0)
  const [news, setNews] = useState(initialNews)

  const loadMoreComponentRef = useRef(null)
  const isInView = useInView(loadMoreComponentRef, {
    margin: '-200px 0px 0px 0px',
  })

  const loadModeNews = useCallback(async () => {
    if (offset === -1) return

    setIsLoading(true)
    const newOffset = offset + 1
    const newNews = await getNewsList({ page: newOffset, limit: NEWS_LIST_LIMIT, countryCode })
    setIsLoading(false)

    if (!newNews || newNews.length < NEWS_LIST_LIMIT) {
      setOffset(-1)
    } else {
      setOffset(newOffset)
    }

    setNews([...news, ...newNews])
  }, [news, offset, countryCode])

  useEffect(() => {
    if (isInView) {
      void loadModeNews()
    }
  }, [isInView, loadModeNews])

  if (!news || news.length === 0) {
    return <EmptyList />
  }

  return (
    <div className="standard-spacing-from-navbar container flex flex-col">
      <div className="flex flex-col gap-8">
        {news.map((newsItem, index) => (
          <React.Fragment key={newsItem.id}>
            {index !== 0 && <hr />}
            <NewsListItem {...newsItem} />
          </React.Fragment>
        ))}
        {isLoading && <Spinner className="mt-4 h-8 w-8 self-center" />}
      </div>
      <div ref={loadMoreComponentRef} />
    </div>
  )
}

function NewsListItem({
  dateHeading,
  source,
  title,
  type,
  url,
  previewImage,
  description,
}: NormalizedNews) {
  const LinkComponent = type === 'internal' ? TrackedInternalLink : TrackedExternalLink

  return (
    <LinkComponent
      aria-label={`Read more about ${title}`}
      className="group text-foreground no-underline hover:no-underline"
      eventProperties={{
        component: AnalyticComponentType.link,
        action: AnalyticActionType.click,
        link: url,
        page: 'Press',
        surface: 'Press Section',
      }}
      href={url}
      title={`Read more about ${title}`}
    >
      <article className="flex flex-col items-center gap-4 group-hover:cursor-pointer">
        {previewImage && (
          <div className="relative h-64 w-64 sm:w-5/12">
            <NextImage
              alt={`Preview image for ${title}`}
              className="h-48 w-full rounded-lg object-cover"
              layout="fill"
              src={previewImage}
            />
          </div>
        )}
        <div className="flex flex-col items-center text-center">
          <strong className="text-primary group-hover:underline group-focus:underline">
            {source}: {title}
          </strong>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">{description}</p>
        </div>
        <p className="text-center font-mono text-sm text-muted-foreground">
          {format(dateHeading, 'MM/dd/yy')}
        </p>
      </article>
    </LinkComponent>
  )
}
