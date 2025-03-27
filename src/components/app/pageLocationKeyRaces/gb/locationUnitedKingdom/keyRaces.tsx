import { DTSIPersonHeroCardSection } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import { organizePeopleGB } from '@/components/app/pageLocationKeyRaces/gb/locationUnitedKingdom/organizePeople'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { formatDTSIDistrictId, normalizeDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP,
  GBCountryCode,
} from '@/utils/shared/gbCountryUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

interface GBKeyRacesProps {
  groups: ReturnType<typeof organizePeopleGB>
  countryCode: SupportedCountryCodes.GB
}

export function GBKeyRaces({ groups, countryCode }: GBKeyRacesProps) {
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
    const stateName = GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP[stateCode as GBCountryCode]

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
            raceCategory === DTSI_PersonRoleCategory.HOUSE_OF_LORDS
              ? 'House of Lords Race'
              : 'House of Commons Race'

          return (
            <DTSIPersonHeroCardSection
              countryCode={countryCode}
              cta={
                <InternalLink href={urls.locationStateSpecific(stateCode as GBCountryCode)}>
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
