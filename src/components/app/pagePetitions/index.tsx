import { partition } from 'lodash-es'

import { PetitionCard } from '@/components/app/pagePetitions/card'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'

const PETITIONS_GRID_CLASSNAMES =
  'grid grid-cols-1 gap-4 md:grid-cols-2 lg:flex lg:grid-cols-3 lg:items-center lg:justify-center lg:gap-8'

interface PagePetitionsProps {
  title: string
  description: string
  petitions: SWCPetition[]
  countryCode: SupportedCountryCodes
}

export function PagePetitions(props: PagePetitionsProps) {
  const { title, description, petitions, countryCode } = props
  const urls = getIntlUrls(countryCode)
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
        <h2 className="mb-6 text-center text-3xl font-bold">Current Petitions</h2>
        <div className={PETITIONS_GRID_CLASSNAMES}>
          {currentPetitions.map(petition => (
            <PetitionCard
              href={urls.petitionDetails(petition.slug)}
              imgSrc={petition.image || undefined}
              isGoalReached={petition.countSignaturesGoal <= petition.signaturesCount}
              isSigned
              key={petition.slug}
              locale={locale}
              signaturesCount={petition.signaturesCount}
              title={petition.title}
              variant="current"
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-center text-3xl font-bold">Past Petitions</h2>
        <div className={PETITIONS_GRID_CLASSNAMES}>
          {pastPetitions.map(petition => (
            <PetitionCard
              className="lg:w-1/3"
              href={urls.petitionDetails(petition.slug)}
              imgSrc={petition.image || undefined}
              key={petition.slug}
              locale={locale}
              signaturesCount={petition.signaturesCount}
              title={petition.title}
              variant="past"
            />
          ))}
        </div>
      </section>
    </div>
  )
}
