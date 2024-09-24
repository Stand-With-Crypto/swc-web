import { MOCK_PRESS_CONTENT } from '@/components/app/pagePress/mock'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

interface PagePressReleaseProps {
  pressContent: (typeof MOCK_PRESS_CONTENT)[0]
}

export function PagePressRelease({ pressContent }: PagePressReleaseProps) {
  const Article = pressContent.Article

  return (
    <div className="standard-spacing-from-navbar container flex flex-col gap-16">
      <section className="space-y-14">
        <div className="container flex flex-col items-center gap-4">
          <PageTitle className="mb-7 font-sans !text-5xl">{pressContent.heading}</PageTitle>
          <PageSubTitle className="text-muted-foreground" size="lg">
            {pressContent.dateHeading}
          </PageSubTitle>
        </div>
      </section>

      <section className="container flex flex-col items-center gap-4">
        <div className="prose lg:prose-lg xl:prose-2xl">
          <Article />
        </div>
      </section>
    </div>
  )
}
