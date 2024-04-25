import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { MaybeOverflowedStancesWithPerson } from '@/components/app/maybeOverflowedStances'
import { PACFooter } from '@/components/app/pacFooter'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { DTSI_DistrictSpecificInformationQuery } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { getIntlUrls } from '@/utils/shared/urls'

export interface LocationUnitedStatesPresidentialProps
  extends DTSI_DistrictSpecificInformationQuery {
  locale: SupportedLocale
}

export function LocationUnitedStatesPresidential({
  people,
  locale,
}: LocationUnitedStatesPresidentialProps) {
  const urls = getIntlUrls(locale)

  return (
    <div>
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className={'mb-4 text-fontcolor-muted'}>
          <InternalLink className="text-fontcolor-muted" href={urls.locationUnitedStates()}>
            United States
          </InternalLink>
          {' / '}
          <span className="font-bold text-primary-cta">Presidential</span>
        </h2>
        <PageTitle as="h1" className="mb-4" size="md">
          U.S. Presidential Race
        </PageTitle>
      </div>
      <ScrollArea>
        <div className="mb-20 flex justify-center gap-4 px-4 pb-4 pl-4">
          {people.map(person => (
            <DTSIPersonHeroCard
              key={person.id}
              locale={locale}
              person={person}
              stanceCount={person.stances.length}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="container mx-auto max-w-4xl space-y-20">
        {people.map(person => (
          <div className="mx-auto max-w-4xl" key={person.id}>
            <MaybeOverflowedStancesWithPerson
              locale={locale}
              person={person}
              stances={person.stances}
            />
          </div>
        ))}
      </div>
      <PACFooter className="container" />
    </div>
  )
}
