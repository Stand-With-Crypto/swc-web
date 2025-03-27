import { DTSIPersonHeroCardSection } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import { organizePeopleCA } from '@/components/app/pageLocationKeyRaces/ca/locationCanada/organizePeople'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { formatDTSIDistrictId, normalizeDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP,
  CAProvinceOrTerritoryCode,
} from '@/utils/shared/stateMappings/caProvinceUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

interface CAKeyRacesProps {
  groups: ReturnType<typeof organizePeopleCA>
  countryCode: SupportedCountryCodes.CA
}

export function CAKeyRaces({ groups, countryCode }: CAKeyRacesProps) {
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
    const stateName =
      CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP[stateCode as CAProvinceOrTerritoryCode]
    return (
      <div className="container flex flex-col items-center" key={stateCode}>
        <PageTitle as="h2" size="sm">
          {stateName}
        </PageTitle>

        {races.map((people, idx) => {
          const raceCategory = people[0].runningForSpecificRole?.roleCategory
          const primaryDistrict =
            people[0].runningForSpecificRole?.primaryDistrict &&
            normalizeDTSIDistrictId(people[0].runningForSpecificRole)

          const subtitleNoDistrict =
            raceCategory === DTSI_PersonRoleCategory.SENATE
              ? 'Senate Race'
              : 'House of Commons Race'

          const linkNoDistrict =
            raceCategory === DTSI_PersonRoleCategory.SENATE
              ? urls.locationStateSpecificSenateRace(stateCode as CAProvinceOrTerritoryCode)
              : urls.locationStateSpecificHouseOfCommonsRace(stateCode as CAProvinceOrTerritoryCode)

          return (
            <DTSIPersonHeroCardSection
              countryCode={countryCode}
              cta={<InternalLink href={linkNoDistrict}>View Race</InternalLink>}
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
