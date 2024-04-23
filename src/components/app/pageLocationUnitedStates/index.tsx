import { compact } from 'lodash-es'

import { ClientCurrentUserDTSIPersonCardOrCTA } from '@/components/app/clientCurrentUserDTSIPersonCardOrCTA'
import { LocationSpecificRaceInfo } from '@/components/app/pageLocationStateSpecific/locationSpecificRaceInfo'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_UnitedStatesInformationQuery } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { pluralize } from '@/utils/shared/pluralize'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

import { organizeStateSpecificPeople } from './organizePeople'

interface LocationUnitedStatesProps extends DTSI_UnitedStatesInformationQuery {
  locale: SupportedLocale
  countAdvocates: number
}

export function LocationUnitedStates({
  runningForPresident,
  locale,
  countAdvocates,
}: LocationUnitedStatesProps) {
  const groups = organizeStateSpecificPeople({ runningForPresident })
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
        <ClientCurrentUserDTSIPersonCardOrCTA locale={locale} />
        {(!!groups.runningFor.president.incumbents.length ||
          !!groups.runningFor.president.candidates.length) && (
          <LocationSpecificRaceInfo
            candidateSections={compact([
              groups.runningFor.president.incumbents.length
                ? {
                    title: pluralize({
                      count: groups.runningFor.president.incumbents.length,
                      singular: 'Incumbent',
                      plural: 'Incumbents',
                    }),
                    people: groups.runningFor.president.incumbents,
                  }
                : null,
              groups.runningFor.president.candidates.length
                ? {
                    title: pluralize({
                      count: groups.runningFor.president.candidates.length,
                      singular: 'Candidate',
                      plural: 'Candidates',
                    }),
                    people: groups.runningFor.president.candidates,
                  }
                : null,
            ])}
            locale={locale}
            title={<>Presidential Race</>}
            url={urls.locationUnitedStatesPresidential()}
          />
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
