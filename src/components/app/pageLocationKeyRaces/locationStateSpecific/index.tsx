import { compact, isEmpty, times } from 'lodash-es'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { ContentSection } from '@/components/app/ContentSection'
import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { DDHQFooter } from '@/components/app/ddhqFooter'
import { PACFooter } from '@/components/app/pacFooter'
import { CongressSection } from '@/components/app/pageLocationKeyRaces/locationStateSpecific/congressSection'
import { CriticalElectionsSection } from '@/components/app/pageLocationKeyRaces/locationStateSpecific/criticalElectionsSection'
import { StancesSection } from '@/components/app/pageLocationKeyRaces/locationStateSpecific/stancesSection'
import { UserActionVotingDayDialog } from '@/components/app/userActionVotingDay/dialog'
import { Button } from '@/components/ui/button'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import {
  GetAllCongressDataResponse,
  RacesVotingDataResponse,
} from '@/data/aggregations/decisionDesk/types'
import { DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP } from '@/utils/shared/locationSpecificPages'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISTRICT_COUNT_MAP } from '@/utils/shared/usStateDistrictUtils'
import { getUSStateNameFromStateCode, USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

import { organizeStateSpecificPeople } from './organizeStateSpecificPeople'

interface LocationStateSpecificProps extends DTSI_StateSpecificInformationQuery {
  stateCode: USStateCode
  locale: SupportedLocale
  countAdvocates: number
  initialRaceData: RacesVotingDataResponse[] | undefined
  initialCongressLiveResultData: GetAllCongressDataResponse
}

export function LocationStateSpecific({
  stateCode,
  people,
  locale,
  countAdvocates,
  personStances,
  initialRaceData,
  initialCongressLiveResultData,
}: LocationStateSpecificProps) {
  const groups = organizeStateSpecificPeople(people)
  const urls = getIntlUrls(locale)
  const stateName = getUSStateNameFromStateCode(stateCode)
  const otherDistricts = compact(
    times(US_STATE_CODE_TO_DISTRICT_COUNT_MAP[stateCode]).map(districtIndex => {
      const district = districtIndex + 1
      if (US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP[stateCode]?.includes(district)) {
        return null
      }
      return district
    }),
  )

  return (
    <div>
      <DarkHeroSection>
        <div className="text-center">
          <h2 className={'mb-4'}>
            <InternalLink className="text-gray-400" href={urls.locationUnitedStates()}>
              United States
            </InternalLink>{' '}
            / <span>{stateName}</span>
          </h2>
          <PageTitle as="h1" className="mb-4" size="md">
            Key Races in {stateName}
          </PageTitle>
          <h3 className="mt-4 text-xl text-gray-400">
            View the races critical to keeping crypto in {stateName}.
          </h3>
          {countAdvocates > 1000 && (
            <h3 className="mt-4 font-mono text-xl font-light">
              <FormattedNumber amount={countAdvocates} locale={locale} /> crypto advocates
            </h3>
          )}
          <LoginDialogWrapper
            authenticatedContent={
              <UserActionVotingDayDialog>
                <Button className="mt-6 w-full max-w-xs" variant="secondary">
                  Claim "I Voted" NFT
                </Button>
              </UserActionVotingDayDialog>
            }
          >
            <Button className="mt-6 w-full max-w-xs" variant="secondary">
              Join Stand With Crypto
            </Button>
          </LoginDialogWrapper>
        </div>
      </DarkHeroSection>

      {isEmpty(groups.senators) && isEmpty(groups.congresspeople) ? null : (
        <div className="mt-20 space-y-20">
          <CongressSection
            initialCongressLiveResultData={initialCongressLiveResultData}
            initialRaceData={initialRaceData}
            locale={locale}
            stateCode={stateCode}
            stateName={stateName}
          />
        </div>
      )}

      {isEmpty(groups.senators) && isEmpty(groups.congresspeople) ? (
        <PageTitle as="h3" className="mt-20" size="sm">
          There's no election data for {stateName}
        </PageTitle>
      ) : (
        <div className="mt-20 space-y-20 xl:space-y-28">
          <CriticalElectionsSection
            groups={groups}
            initialRaceData={initialRaceData}
            locale={locale}
            stateCode={stateCode}
            stateName={stateName}
          />

          {US_STATE_CODE_TO_DISTRICT_COUNT_MAP[stateCode] > 1 && (
            <ContentSection
              className="container"
              subtitle={'Dive deeper and discover races in other districts.'}
              title={`Other races in ${stateName}`}
            >
              <div className="grid grid-cols-2 gap-3 text-center md:grid-cols-3 xl:grid-cols-4">
                {otherDistricts.map(district => (
                  <InternalLink
                    className={cn('mb-4 block flex-shrink-0 font-semibold')}
                    href={urls.locationDistrictSpecific({
                      stateCode,
                      district,
                    })}
                    key={district}
                  >
                    District {district}
                  </InternalLink>
                ))}
              </div>
            </ContentSection>
          )}

          {!!personStances.length && (
            <StancesSection
              locale={locale}
              stances={personStances}
              stateCode={stateCode}
              stateName={stateName}
            />
          )}

          <PACFooter className="container text-center" />
          <DDHQFooter className="container text-center" />
        </div>
      )}
    </div>
  )
}
