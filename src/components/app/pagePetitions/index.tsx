import { partition } from 'lodash-es'

import { PetitionsContent } from '@/components/app/pagePetitions/petitionsContent'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'

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
    <PetitionsContent
      countryCode={countryCode}
      currentPetitions={currentPetitions}
      description={description}
      locale={locale}
      pastPetitions={pastPetitions}
      title={title}
    />
  )
}
