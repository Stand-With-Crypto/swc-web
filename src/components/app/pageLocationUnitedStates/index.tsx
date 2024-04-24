import { DTSIPersonCard } from '@/components/app/dtsiPersonCard'
import { LocationSpecificRaceInfo } from '@/components/app/pageLocationStateSpecific/locationSpecificRaceInfo'
import { Button } from '@/components/ui/button'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_UnitedStatesInformationQuery } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

import { organizePeople } from './organizePeople'

interface LocationUnitedStatesProps extends DTSI_UnitedStatesInformationQuery {
  locale: SupportedLocale
  countAdvocates: number
}

export function LocationUnitedStates({
  locale,
  countAdvocates,
  ...queryData
}: LocationUnitedStatesProps) {
  const { endorsed } = queryData
  const groups = organizePeople(queryData)
  const urls = getIntlUrls(locale)
  return (
    <div className="container max-w-4xl space-y-20">
      <div className="text-center">
        <PageTitle as="h1" size="md">
          Key Races in the United States
        </PageTitle>
        {countAdvocates > 1000 && (
          <h3 className="mt-4 text-xl font-bold text-primary-cta">
            <FormattedNumber amount={countAdvocates} locale={locale} /> crypto advocates
          </h3>
        )}
      </div>
      <div className="divide-y-2 *:py-20 first:*:pt-0 last:*:pb-0">
        {!!groups.president.length && (
          <LocationSpecificRaceInfo
            candidates={groups.president}
            locale={locale}
            title={<>Presidential Race</>}
            url={urls.locationUnitedStatesPresidential()}
          />
        )}
        {!!endorsed.length && (
          <section className="space-y-8">
            <div>
              <PageTitle as="h3" size="sm">
                SWC Endorsed Candidates
              </PageTitle>
            </div>
            {endorsed.map(person => (
              <DTSIPersonCard
                key={person.id}
                locale={locale}
                overrideDescriptor="recommended"
                person={person}
                subheader="role"
              />
            ))}
            <div className="text-center">
              <Button asChild className="max-sm:w-full">
                <InternalLink href={urls.endorsedCandidates()}>View Endorsements</InternalLink>
              </Button>
            </div>
          </section>
        )}

        <div>
          <section className="space-y-10">
            <PageTitle as="h3" className="mb-3" size="sm">
              States
            </PageTitle>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP).map(_stateCode => {
                const stateCode = _stateCode as USStateCode
                return (
                  <InternalLink
                    className={cn('mb-4 block flex-shrink-0 font-semibold')}
                    href={urls.locationStateSpecific(stateCode)}
                    key={stateCode}
                  >
                    {US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode]}
                  </InternalLink>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
