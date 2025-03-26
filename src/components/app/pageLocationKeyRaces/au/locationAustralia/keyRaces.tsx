import { DTSIPersonHeroCardSection } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import { organizePeopleAU } from '@/components/app/pageLocationKeyRaces/au/locationAustralia/organizePeople'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { formatDTSIDistrictId, normalizeDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'

interface AUKeyRacesProps {
  groups: ReturnType<typeof organizePeopleAU>
  countryCode: SupportedCountryCodes
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
    // TODO: Add CA state name mapping @olavoparno
    const stateName = US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode as USStateCode]
    return (
      <div className="container flex flex-col items-center" key={stateCode}>
        <NextImage
          alt={`${stateName} shield`}
          height={150}
          src={`/stateShields/${stateCode}.png`}
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
                          // TODO: Add CA state name mapping @olavoparno
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
