import { DTSIPersonHeroCardSection } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import { organizePeople } from '@/components/app/pageLocationKeyRaces/us/locationUnitedStates/organizePeople'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { StateShield } from '@/components/ui/stateShield'
import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { formatDTSIDistrictId, normalizeDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

interface USKeyRacesProps {
  groups: ReturnType<typeof organizePeople>
  countryCode: SupportedCountryCodes
}

export function USKeyRaces({ groups, countryCode }: USKeyRacesProps) {
  const urls = getIntlUrls(countryCode)

  const keyRaces = Object.entries(groups.keyRaces)

  if (keyRaces.length === 0) {
    return (
      <div className="container flex flex-col items-center">
        <PageTitle as="h2" size="sm">
          No key races found
        </PageTitle>
      </div>
    )
  }

  return keyRaces.map(([stateCode, races]) => {
    const stateName = US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode as USStateCode]
    return (
      <div className="container flex flex-col items-center" key={stateCode}>
        <StateShield countryCode={countryCode} size={150} state={stateCode} />

        <PageTitle as="h2" size="sm">
          {stateName}
        </PageTitle>

        {races.map((people, idx) => {
          const raceCategory = people[0].runningForSpecificRole?.roleCategory
          const primaryDistrict =
            people[0].runningForSpecificRole?.primaryDistrict &&
            normalizeDTSIDistrictId(people[0].runningForSpecificRole)

          const subtitleNoDistrict =
            raceCategory === DTSI_PersonRoleCategory.GOVERNOR ? 'Governor Race' : 'Senate Race'

          const linkNoDistrict =
            raceCategory === DTSI_PersonRoleCategory.GOVERNOR
              ? urls.locationStateSpecificGovernorRace(stateCode as USStateCode)
              : urls.locationStateSpecificSenateRace(stateCode as USStateCode)

          return (
            <DTSIPersonHeroCardSection
              countryCode={countryCode}
              cta={
                <InternalLink
                  href={
                    primaryDistrict
                      ? urls.locationDistrictSpecific({
                          stateCode: stateCode as USStateCode,
                          district: primaryDistrict,
                        })
                      : linkNoDistrict
                  }
                >
                  View Race
                </InternalLink>
              }
              key={`${stateCode}-${primaryDistrict ?? idx}`}
              people={people}
              subtitle={
                primaryDistrict ? (
                  <>
                    {stateName} {formatDTSIDistrictId(primaryDistrict)} Congressional District Race
                  </>
                ) : (
                  <>
                    {stateName} {subtitleNoDistrict}
                  </>
                )
              }
              title=""
            />
          )
        })}
      </div>
    )
  })
}
