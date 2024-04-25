import Balancer from 'react-wrap-balancer'

import { CryptoSupportHighlight } from '@/components/app/cryptoSupportHighlight'
import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { DTSIStanceDetails } from '@/components/app/dtsiStanceDetails'
import {
  DTSIStanceDetailsPersonProp,
  DTSIStanceDetailsStancePassedProp,
} from '@/components/app/dtsiStanceDetails/types'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { SupportedLocale } from '@/intl/locales'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { possessive } from '@/utils/shared/possessive'
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
  locale: SupportedLocale
}

export function MaybeOverflowedStances({ person, stances, locale }: Props) {
  const stancesContent = stances.slice(0, 3).map(stance => (
    <div key={stance.id}>
      <DTSIStanceDetails
        bodyClassName="line-clamp-6"
        hideImages
        locale={locale}
        person={person}
        stance={stance}
      />
      <CryptoSupportHighlight className="mx-auto mt-2" stanceScore={stance.computedStanceScore} />
    </div>
  ))
  if (stances.length < 4) {
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
          <InternalLink href={getIntlUrls(locale).politicianDetails(person.slug)}>
            View all statements
          </InternalLink>
        </Button>
      </div>
    </div>
  )
}

export function MaybeOverflowedStancesWithPerson({ person, stances, locale }: Props) {
  if (!stances.length) {
    return (
      <div>
        <div className="mb-6 text-center">
          <div className="relative inline-block h-[100] w-[100]">
            <DTSIAvatar person={person} size={100} />
            <div className="absolute bottom-0 right-[-8px]">
              <DTSIFormattedLetterGrade person={person} size={25} />
            </div>
          </div>

          <p className="mt-8 text-xl font-bold">
            <Balancer>
              {possessive(dtsiPersonFullName(person))} has no statements on crypto
            </Balancer>
          </p>
        </div>
      </div>
    )
  }
  return (
    <div>
      <div className="mb-6 text-center">
        <div className="relative inline-block h-[100] w-[100]">
          <DTSIAvatar person={person} size={100} />
          <div className="absolute bottom-0 right-[-8px]">
            <DTSIFormattedLetterGrade person={person} size={25} />
          </div>
        </div>{' '}
        <p className="mt-8 text-xl font-bold">
          <Balancer>{possessive(dtsiPersonFullName(person))} statements on crypto</Balancer>
        </p>
        <p className="mt-4 text-fontcolor-muted">
          <Balancer>
            Take a look at relevant tweets and statements made by {person.lastName}.
          </Balancer>
        </p>
      </div>
      <MaybeOverflowedStances locale={locale} person={person} stances={stances} />
    </div>
  )
}
