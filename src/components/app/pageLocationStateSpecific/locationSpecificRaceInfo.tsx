import { DTSIPersonCard } from '@/components/app/dtsiPersonCard'
import { FormattedPerson } from '@/components/app/pageLocationStateSpecific/types'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { SupportedLocale } from '@/intl/locales'

export function LocationSpecificRaceInfo({
  title,
  url,
  candidateSections,
  children,
  locale,
}: {
  locale: SupportedLocale
  title: React.ReactNode
  children?: React.ReactNode
  url: string
  candidateSections: Array<{ title: string; people: FormattedPerson[] }>
}) {
  return (
    <section className="space-y-8">
      <div>
        <PageTitle as="h3" size="sm">
          {title}
        </PageTitle>
        {children}
      </div>
      {candidateSections.map(section => (
        <div className="space-y-5" key={section.title}>
          <div className="text-center">
            <h4 className="inline-block rounded-full bg-muted p-2 font-bold">{section.title}</h4>
          </div>
          {section.people.map(person => (
            <DTSIPersonCard key={person.id} locale={locale} person={person} subheader="role" />
          ))}
        </div>
      ))}
      <div className="mt-8 text-center">
        <Button asChild className="max-sm:w-full">
          <InternalLink href={url}>View race</InternalLink>
        </Button>
      </div>
    </section>
  )
}
