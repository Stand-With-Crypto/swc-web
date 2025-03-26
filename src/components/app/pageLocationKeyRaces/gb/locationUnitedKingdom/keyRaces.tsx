import { DTSIPersonHeroCardSection } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import { organizePeopleGB } from '@/components/app/pageLocationKeyRaces/gb/locationUnitedKingdom/organizePeople'
import { ImageWithFallbackOnError } from '@/components/ui/imageWithFallbackOnError'
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
        <ImageWithFallbackOnError
          alt={`${stateName} shield`}
          fallbackSrc="/logo/shield.png"
          height={150}
          src={`/stateShields/gb/${stateCode}.png`}
          width={150}
        />

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
              ? urls.locationStateSpecificGovernorRace(stateCode as GBCountryCode)
              : urls.locationStateSpecificSenateRace(stateCode as GBCountryCode)

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
