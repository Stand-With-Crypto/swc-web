import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

export function PagePollsHeader({
  title,
  description,
  hasPolls,
}: {
  title: string
  description: string
  hasPolls: boolean
}) {
  return (
    <section className="container mb-16 max-w-3xl p-0">
      <PageTitle className="mb-7">{title}</PageTitle>
      <PageSubTitle className="text-muted-foreground" size="md" withoutBalancer>
        {!hasPolls ? (
          <div className="mt-12">
            <p>No Polls available at the moment.</p>
            <p>Please check back later.</p>
            <p className="mt-4">
              <InternalLink href="/about">Our mission</InternalLink>
            </p>
          </div>
        ) : (
          description
        )}
      </PageSubTitle>
    </section>
  )
}
