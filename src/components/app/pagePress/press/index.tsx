import { MOCK_PRESS_CONTENT } from '@/app/[locale]/press/mock'
import { PressSection } from '@/components/app/pagePress/press/pressSection'
import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

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
        {pressContent.map(({ dateHeading, heading, slug, link }) => {
          return (
            <PressSection dateHeading={dateHeading} heading={heading} key={slug}>
              <Button asChild variant="secondary">
                <ExternalLink
                  aria-label={`Read more about ${heading}`}
                  className="text-foreground no-underline hover:no-underline"
                  href={link}
                  title={`Read more about ${heading}`}
                >
                  Read more
                </ExternalLink>
              </Button>
            </PressSection>
          )
        })}
      </div>
    </div>
  )
}
