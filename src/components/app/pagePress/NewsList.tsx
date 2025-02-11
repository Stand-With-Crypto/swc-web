import { Button } from '@/components/ui/button'
import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { TrackedExternalLink } from '@/components/ui/trackedExternalLink'
import { TrackedInternalLink } from '@/components/ui/trackedInternalLink'
import { NormalizedNews } from '@/utils/server/builder/models/data/news'
import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'
import { DEFAULT_LOCALE } from '@/utils/shared/supportedLocales'

interface NewsListProps {
  pressContent: NormalizedNews[]
}

export function NewsList({ pressContent }: NewsListProps) {
  return (
    <div className="standard-spacing-from-navbar container flex flex-col gap-20">
      <div className="flex flex-col gap-16">
        {pressContent.map(({ dateHeading, source, title, type, url }, idx) => {
          const LinkComponent = type === 'internal' ? TrackedInternalLink : TrackedExternalLink

          return (
            <section key={idx}>
              <div className="container flex flex-col items-center gap-2">
                {dateHeading && (
                  <p className="text-center font-mono text-sm text-muted-foreground">
                    <FormattedDatetime
                      date={dateHeading}
                      day="numeric"
                      locale={DEFAULT_LOCALE}
                      month="long"
                      year="numeric"
                    />
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
      </div>
    </div>
  )
}
