'use client'

import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { InfoCard } from '@/components/ui/infoCard'
import { DTSIPersonDetails } from '@/data/dtsi/queries/queryDTSIPersonDetails'
import { useCountryCode } from '@/hooks/useCountryCode'
import {
  dtsiPersonFullName,
  shouldPersonHaveStanceScoresHidden,
} from '@/utils/dtsi/dtsiPersonUtils'
import { convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence } from '@/utils/dtsi/dtsiStanceScoreUtils'
import { pluralize } from '@/utils/shared/pluralize'
import { COUNTRY_CODE_TO_LOCALE } from '@/utils/shared/supportedCountries'

interface ScoreExplainerProps {
  person: DTSIPersonDetails
}

export function ScoreExplainer({ person }: ScoreExplainerProps) {
  const countryCode = useCountryCode()
  const isStanceHidden = shouldPersonHaveStanceScoresHidden(person)

  return (
    <InfoCard className="my-8 flex items-center gap-4 text-left sm:mb-16 sm:mt-10 sm:p-6">
      {!isStanceHidden && (
        <div>
          <DTSIFormattedLetterGrade className="h-14 w-14" person={person} />
        </div>
      )}
      <div>
        {!isStanceHidden && (
          <h3 className="font-semibold md:text-xl">
            {convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence(person)}
          </h3>
        )}
        <h4 className="text-sm text-fontcolor-muted md:text-base">
          {dtsiPersonFullName(person)} has made{' '}
          <FormattedNumber
            amount={person.stances.length}
            locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
          />{' '}
          {pluralize({ singular: 'statement', count: person.stances.length })} about crypto.
        </h4>
      </div>
    </InfoCard>
  )
}
