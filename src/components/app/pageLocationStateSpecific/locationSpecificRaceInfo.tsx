import { DTSIPersonCard } from '@/components/app/dtsiPersonCard'
import { FormattedPerson } from '@/components/app/pageLocationStateSpecific/types'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedLocale } from '@/intl/locales'

export function LocationSpecificRaceInfo({
  title,
  url,
  candidates,
  children,
  locale,
}: {
  locale: SupportedLocale
  title: React.ReactNode
  children?: React.ReactNode
  url: string
  candidates: FormattedPerson[]
}) {
  return (
    <section className="space-y-8">
      <div>
        <PageTitle as="h3" size="sm">
          {title}
        </PageTitle>
        {children}
      </div>
      {candidates.map(person => (
        <DTSIPersonCard
          key={person.id}
          locale={locale}
          person={person}
          subheader="role"
          subheaderFormatter={val => (person.isIncumbent ? 'Incumbent' : val)}
        />
      ))}
      <div className="mt-8 text-center">
        <Button asChild className="max-sm:w-full">
          <InternalLink href={url}>View race</InternalLink>
        </Button>
      </div>
    </section>
  )
}
