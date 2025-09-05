import { partition } from 'lodash-es'

import { PetitionCard } from '@/components/app/pagePetitions/card'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'
import { cn } from '@/utils/web/cn'

const PETITIONS_GRID_CLASSNAMES =
  'grid grid-cols-1 gap-4 lg:flex lg:grid-cols-3 lg:items-center lg:justify-center lg:gap-8'

interface PagePetitionsProps {
  title: string
  description: string
  petitions: SWCPetition[]
  countryCode: SupportedCountryCodes
}

export function PagePetitions(props: PagePetitionsProps) {
  const { title, description, petitions, countryCode } = props
  const locale = COUNTRY_CODE_TO_LOCALE[countryCode]

  const [currentPetitions, pastPetitions] = partition(
    petitions,
    petition => !petition.datetimeFinished,
  )

  return (
    <div className="standard-spacing-from-navbar container space-y-20">
      <section className="space-y-7 text-center">
        <PageTitle>{title}</PageTitle>
        <PageSubTitle>{description}</PageSubTitle>
      </section>

      <section>
        <h2 className="mb-6 text-center text-3xl font-bold">
          {currentPetitions.length > 0 ? 'Current Petitions' : 'There are no current petitions'}
        </h2>
        <div className={PETITIONS_GRID_CLASSNAMES}>
          {currentPetitions.map(petition => (
            <PetitionCard
              className="lg:w-1/3"
              countryCode={countryCode}
              imgSrc={petition.image || undefined}
              isGoalReached={petition.countSignaturesGoal <= petition.signaturesCount}
              key={petition.slug}
              locale={locale}
              signaturesCount={petition.signaturesCount}
              slug={petition.slug}
              title={petition.title}
              variant="current"
            />
          ))}
        </div>
      </section>

      <section className={cn(pastPetitions.length <= 0 && 'hidden')}>
        <h2 className="mb-6 text-center text-3xl font-bold">Past Petitions</h2>
        <div className={PETITIONS_GRID_CLASSNAMES}>
          {pastPetitions.map(petition => (
            <PetitionCard
              className="lg:w-1/3"
              countryCode={countryCode}
              imgSrc={petition.image || undefined}
              key={petition.slug}
              locale={locale}
              signaturesCount={petition.signaturesCount}
              slug={petition.slug}
              title={petition.title}
              variant="past"
            />
          ))}
        </div>
      </section>
    </div>
  )
}
