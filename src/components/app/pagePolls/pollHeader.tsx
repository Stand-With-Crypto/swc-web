import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

interface PagePollsHeaderProps {
  title: string
  description: string
  hasPolls: boolean
}

export function PagePollsHeader({ title, description, hasPolls }: PagePollsHeaderProps) {
  return (
    <section className="container mb-16 max-w-3xl p-0">
      <PageTitle className="mb-7">{title}</PageTitle>
      {!hasPolls ? (
        <div className="mt-12 text-center text-base text-muted-foreground md:text-lg">
          <p>No Polls available at the moment.</p>
          <p>Please check back later.</p>
        </div>
      ) : (
        <PageSubTitle className="text-muted-foreground" size="md" withoutBalancer>
          {description}
        </PageSubTitle>
      )}
    </section>
  )
}
