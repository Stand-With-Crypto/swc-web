import { orderBy } from 'lodash-es'

import { DTSIStanceDetails } from '@/components/app/dtsiStanceDetails'
import {
  DTSIStanceDetailsPersonProp,
  DTSIStanceDetailsStancePassedProp,
} from '@/components/app/dtsiStanceDetails/types'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

interface Props {
  person: DTSIStanceDetailsPersonProp & {
    slug: string
    computedStanceScore: number | null | undefined
    manuallyOverriddenStanceScore: number | null | undefined
  }
  stances: Array<
    DTSIStanceDetailsStancePassedProp & { computedStanceScore: number | null | undefined }
  >
  countryCode: SupportedCountryCodes
}

export function MaybeOverflowedStances({ person, stances, countryCode }: Props) {
  const orderedStances = orderBy(stances, x => -1 * new Date(x.dateStanceMade).getTime())

  const stancesContent = orderedStances
    .slice(0, 3)
    .map(stance => (
      <DTSIStanceDetails
        countryCode={countryCode}
        key={stance.id}
        person={person}
        stance={stance}
      />
    ))

  if (orderedStances.length < 4) {
    return <div className="space-y-6">{stancesContent}</div>
  }
  return (
    <div>
      <div className="relative space-y-6">
        {stancesContent}
        <div
          className="absolute bottom-0 left-0 right-0 h-[300px]"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)',
          }}
        />
      </div>
      <div className="mt-6 text-center">
        <Button asChild className="max-sm:w-full">
          <InternalLink href={getIntlUrls(countryCode).politicianDetails(person.slug)}>
            View all statements
          </InternalLink>
        </Button>
      </div>
    </div>
  )
}
