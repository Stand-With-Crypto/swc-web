import { DTSIPersonHeroCardSection } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import { organizePeopleAU } from '@/components/app/pageLocationKeyRaces/au/locationAustralia/organizePeople'
import { ImageWithFallbackOnError } from '@/components/ui/imageWithFallbackOnError'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { formatDTSIDistrictId, normalizeDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { AU_STATE_CODE_TO_DISPLAY_NAME_MAP, AUStateCode } from '@/utils/shared/auStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

interface AUKeyRacesProps {
  groups: ReturnType<typeof organizePeopleAU>
  countryCode: SupportedCountryCodes.AU
}

export function AUKeyRaces({ groups, countryCode }: AUKeyRacesProps) {
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
    const stateName = AU_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode as AUStateCode]
    return (
      <div className="container flex flex-col items-center" key={stateCode}>
        <ImageWithFallbackOnError
          alt={`${stateName} shield`}
          fallbackSrc="/logo/shield.png"
          height={150}
          src={`/stateShields/au/${stateCode}.png`}
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
              ? urls.locationStateSpecificGovernorRace(stateCode as AUStateCode)
              : urls.locationStateSpecificSenateRace(stateCode as AUStateCode)

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
