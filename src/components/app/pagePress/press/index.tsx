import { PressSection } from '@/components/app/pagePress/press/pressSection'
import { Button } from '@/components/ui/button'
import { TrackedExternalLink } from '@/components/ui/trackedExternalLink'
import { TrackedInternalLink } from '@/components/ui/trackedInternalLink'
import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'

export interface PressContent {
  dateHeading: Date
  title: string
  source: string
  url: string
}

interface PagePressProps {
  pressContent: PressContent[]
}

export function PagePress({ pressContent }: PagePressProps) {
  return (
    <div className="standard-spacing-from-navbar container flex flex-col gap-20">
      <div className="flex flex-col gap-16">
        {pressContent.map(({ dateHeading, title, source, url }, idx) => {
          const isInternal = source === 'Press Release' && url.startsWith('/')

          const LinkComponent = isInternal ? TrackedInternalLink : TrackedExternalLink

          return (
            <PressSection
              dateHeading={dateHeading.toDateString()}
              heading={title}
              key={idx}
              publication={source}
            >
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
            </PressSection>
          )
        })}
      </div>
    </div>
  )
}
