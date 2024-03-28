import { DTSIPersonCardForLocation } from '@/components/app/dtsiPersonWithinRoleContext'
import { FormattedPerson } from '@/components/app/pageLocationStateSpecific/types'
import { Button } from '@/components/ui/button'
import { uppercaseSectionHeader } from '@/components/ui/classUtils'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { cn } from '@/utils/web/cn'

export function LocationSpecificRaceInfoContainer({ children }: { children: React.ReactNode }) {
  return (
    // div ensures the spacing divider is full width
    <div>
      <section className="mx-auto max-w-2xl space-y-10">{children}</section>
    </div>
  )
}

export function LocationSpecificRaceInfo({
  subtitle,
  title,
  url,
  candidateSections,
  children,
}: {
  subtitle: React.ReactNode
  title: React.ReactNode
  children?: React.ReactNode
  url: string
  candidateSections: Array<{ title: string; people: FormattedPerson[] }>
}) {
  return (
    <LocationSpecificRaceInfoContainer>
      <div className="flex items-end justify-between">
        <div>
          <h3 className={cn(uppercaseSectionHeader, 'mb-3')}>{subtitle}</h3>
          <PageTitle as="h3" size="sm">
            {title}
          </PageTitle>
        </div>
        <div className="hidden md:inline">
          <Button asChild variant="secondary">
            <InternalLink href={url}>View race</InternalLink>
          </Button>
        </div>
      </div>
      {candidateSections.map(section => (
        <div className="space-y-5" key={section.title}>
          <h4 className={uppercaseSectionHeader}>{section.title}</h4>
          {section.people.map(person => (
            <DTSIPersonCardForLocation key={person.id} person={person} />
          ))}
        </div>
      ))}
      <div className="md:hidden">
        <Button asChild className="w-full" variant="secondary">
          <InternalLink href={url}>View race</InternalLink>
        </Button>
      </div>
      {children}
    </LocationSpecificRaceInfoContainer>
  )
}
