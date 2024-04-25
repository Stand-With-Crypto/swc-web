import { DTSIPersonCard } from '@/components/app/dtsiPersonCard'
import { MaybeOverflowedStances } from '@/components/app/maybeOverflowedStances'
import { SupportedLocale } from '@/intl/locales'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'

import { FormattedPerson } from './types'

export function CandidateInfo({
  person,
  locale,
  isRecommended,
}: {
  person: FormattedPerson
  isRecommended?: boolean
  locale: SupportedLocale
}) {
  return (
    <div className="space-y-4">
      <div className="max-w-4xl">
        <DTSIPersonCard
          key={person.id}
          locale={locale}
          overrideDescriptor={isRecommended ? 'recommended' : undefined}
          person={person}
          subheader="role"
        />
      </div>
      {!!person.stances.length && (
        <>
          <h3 className="text-center text-xl font-bold">
            {dtsiPersonFullName(person)} Relevant Statements
          </h3>
          <h4 className="text-center">
            Take a look at relevant tweets and statements made by {dtsiPersonFullName(person)}.
          </h4>
          <MaybeOverflowedStances locale={locale} person={person} stances={person.stances} />
        </>
      )}
    </div>
  )
}
