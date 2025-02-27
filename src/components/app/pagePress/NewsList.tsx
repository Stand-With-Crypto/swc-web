'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { motion, useInView } from 'motion/react'

import { Button } from '@/components/ui/button'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { Skeleton } from '@/components/ui/skeleton'
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
  const [offset, setOffset] = useState(0)
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

  return (
    <div className="standard-spacing-from-navbar container flex flex-col gap-20">
      <div className="flex flex-col gap-16">
        {news.map(({ dateHeading, source, title, type, url, id }) => {
          const LinkComponent = type === 'internal' ? TrackedInternalLink : TrackedExternalLink

          return (
            <section key={id}>
              <div className="container flex flex-col items-center gap-2">
                {dateHeading && (
                  <p className="text-center font-mono text-sm text-muted-foreground">
                    {format(dateHeading, 'MMMM d, yyyy')}
                  </p>
                )}
                <PageSubTitle className={'font-bold text-foreground'} size="md">
                  {source}: {title}
                </PageSubTitle>
              </div>
              <div className={'mt-4 flex items-center justify-center'}>
                <Button asChild variant="secondary">
                  <LinkComponent
                    aria-label={`Read more about ${title}`}
                    className="text-foreground no-underline hover:no-underline"
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
                    Read more
                  </LinkComponent>
                </Button>
              </div>
            </section>
          )
        })}
        {isLoading && <ListItemSkeleton />}
      </div>
      <div ref={loadMoreComponentRef} />
    </div>
  )
}

function ListItemSkeleton() {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, scale: 0.5 }}
      transition={{
        duration: 0.1,
        ease: [0, 0.71, 0.2, 1.01],
      }}
    >
      <Skeleton className="h-7 w-44" />
      <Skeleton className="mt-2 h-8 w-11/12" />
      <Skeleton className="mt-3">
        <Button>Read more</Button>
      </Skeleton>
    </motion.div>
  )
}
