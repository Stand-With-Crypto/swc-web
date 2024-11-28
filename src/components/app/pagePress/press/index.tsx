import { MOCK_PRESS_CONTENT } from '@/components/app/pagePress/mock'
import { PressSection } from '@/components/app/pagePress/press/pressSection'
import { Button } from '@/components/ui/button'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { TrackedExternalLink } from '@/components/ui/trackedExternalLink'
import { TrackedInternalLink } from '@/components/ui/trackedInternalLink'
import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'
import { slugify } from '@/utils/shared/slugify'

interface PagePressProps {
  title: string
  description: string
  pressContent: typeof MOCK_PRESS_CONTENT
}

export function PagePress({ title, description, pressContent }: PagePressProps) {
  return (
    <div className="standard-spacing-from-navbar container flex flex-col gap-20">
      <section className="container">
        <PageTitle className="mb-7">{title}</PageTitle>
        <PageSubTitle className="text-muted-foreground" size="md">
          {description}
        </PageSubTitle>
      </section>

      <div className="flex flex-col gap-16">
        {pressContent.map(({ dateHeading, heading, publication, link }) => {
          const isInternal = publication === 'Press Release' && link.startsWith('/')

          const LinkComponent = isInternal ? TrackedInternalLink : TrackedExternalLink
          const currentLink = isInternal ? `/press/${slugify(link) ?? ''}` : link

          return (
            <PressSection
              dateHeading={dateHeading}
              heading={heading}
              key={publication}
              publication={publication}
            >
              <Button asChild variant="secondary">
                <LinkComponent
                  aria-label={`Read more about ${heading}`}
                  className="text-foreground no-underline hover:no-underline"
                  eventProperties={{
                    component: AnalyticComponentType.link,
                    action: AnalyticActionType.click,
                    link,
                    page: 'Press',
                    surface: 'Press Section',
                  }}
                  href={currentLink}
                  title={`Read more about ${heading}`}
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
