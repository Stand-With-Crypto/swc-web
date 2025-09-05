'use client'

import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { PoliticianDetails } from '@/components/app/pagePoliticianDetails/common/types'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { InfoCard } from '@/components/ui/infoCard'
import { useCountryCode } from '@/hooks/useCountryCode'
import { shouldPersonHaveStanceScoresHidden } from '@/utils/dtsi/dtsiPersonUtils'
import { convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence } from '@/utils/dtsi/dtsiStanceScoreUtils'
import { pluralize } from '@/utils/shared/pluralize'
import { COUNTRY_CODE_TO_LOCALE } from '@/utils/shared/supportedCountries'

interface ScoreExplainerProps {
  person: PoliticianDetails
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
          {person.stancesCount ? (
            <>
              Based on{' '}
              <FormattedNumber
                amount={person.statementsCount}
                locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
              />{' '}
              {pluralize({ singular: 'statement', count: person.statementsCount })} and{' '}
              <FormattedNumber
                amount={person.votesCount}
                locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
              />{' '}
              {pluralize({ singular: 'vote', count: person.votesCount })}.
            </>
          ) : (
            '0 statements'
          )}
        </h4>
      </div>
    </InfoCard>
  )
}
