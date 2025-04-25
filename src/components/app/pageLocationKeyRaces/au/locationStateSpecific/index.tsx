import { isEmpty } from 'lodash-es'

import { DTSIPersonHeroCardSection } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common/locationRaces'
import { InternalLink } from '@/components/ui/link'
import { DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'
import { AUStateCode, getAUStateNameFromStateCode } from '@/utils/shared/stateMappings/auStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { AUUserActionViewKeyRacesCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'

import { organizeAUStateSpecificPeople } from './organizeStateSpecificPeople'

interface LocationStateSpecificProps extends DTSI_StateSpecificInformationQuery {
  stateCode: AUStateCode
}

const countryCode = SupportedCountryCodes.AU
const urls = getIntlUrls(countryCode)

export function AULocationStateSpecific({ stateCode, congress }: LocationStateSpecificProps) {
  const groups = organizeAUStateSpecificPeople(congress)
  const stateName = getAUStateNameFromStateCode(stateCode)

  return (
    <>
      <LocationRaces.ActionRegisterer
        input={{
          campaignName: AUUserActionViewKeyRacesCampaignName['H1_2025'],
          countryCode,
          stateCode,
        }}
      />

      {isEmpty(groups.senators) ? (
        <LocationRaces.EmptyMessage gutterTop>
          There's no key races currently in {stateName}
        </LocationRaces.EmptyMessage>
      ) : (
        <div className="space-y-20">
          <div className="mt-20">
            <DTSIPersonHeroCardSection
              countryCode={countryCode}
              cta={
                <InternalLink href={urls.locationStateSpecificSenateRace(stateCode)}>
                  View Race
                </InternalLink>
              }
              people={groups.senators}
              title={<>Australian Senate Race ({stateCode})</>}
            />
          </div>
        </div>
      )}
    </>
  )
}
