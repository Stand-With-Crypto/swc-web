import { MOCK_PRESS_CONTENT } from '@/app/[locale]/press/mock'
import { PressSection } from '@/components/app/pagePress/press/pressSection'
import { Button } from '@/components/ui/button'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { TrackedExternalLink } from '@/components/ui/trackedExternalLink'
import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'

interface PagePressProps {
  title: string
  description: string
  pressContent: typeof MOCK_PRESS_CONTENT
}

export function PagePress({ title, description, pressContent }: PagePressProps) {
  return (
    <div className="standard-spacing-from-navbar container flex flex-col gap-20">
      <section className="space-y-14">
        <div className="container flex flex-col items-center gap-4">
          <PageTitle className="mb-7 font-sans !text-5xl">{title}</PageTitle>
          <PageSubTitle className="text-muted-foreground" size="md">
            {description}
          </PageSubTitle>
        </div>
      </section>

      <div className="flex flex-col gap-16">
        {pressContent.map(({ dateHeading, heading, publication, link }) => {
          return (
            <PressSection
              dateHeading={dateHeading}
              heading={heading}
              key={publication}
              publication={publication}
            >
              <Button asChild variant="secondary">
                <TrackedExternalLink
                  aria-label={`Read more about ${heading}`}
                  className="text-foreground no-underline hover:no-underline"
                  eventProperties={{
                    component: AnalyticComponentType.link,
                    action: AnalyticActionType.click,
                    link,
                    page: 'Press',
                    surface: 'Press Section',
                  }}
                  href={link}
                  title={`Read more about ${heading}`}
                >
                  Read more
                </TrackedExternalLink>
              </Button>
            </PressSection>
          )
        })}
      </div>
    </div>
  )
}
