import { DTSIPersonHeroCardSection } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import { organizePeople } from '@/components/app/pageLocationKeyRaces/us/locationUnitedStates/organizePeople'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ResponsiveTabsOrSelect } from '@/components/ui/responsiveTabsOrSelect'
import { DTSI_PersonPoliticalAffiliationCategory } from '@/data/dtsi/generated'
import {
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

interface USKeyRacesProps {
  groups: ReturnType<typeof organizePeople>
}

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

export function USKeyRaces({ groups }: USKeyRacesProps) {
  const urls = getIntlUrls(countryCode)

  const keyRaces = Object.entries(groups.keyRaces)

  if (keyRaces.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <PageTitle as="h2" size="sm">
          No key races found
        </PageTitle>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-20">
      {keyRaces.map(([stateCode, races]) => {
        const stateName = US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode as USStateCode]
        return (
          <div className="flex flex-col items-center gap-10" key={stateCode}>
            <div className="flex flex-col items-center gap-4">
              <PageTitle as="h2" size="md">
                {stateName} Gubernatorial Election
              </PageTitle>
              <PageSubTitle>November 4, 2025</PageSubTitle>
            </div>

            {races.map(people => {
              const republicanPeople = people.filter(
                person =>
                  person.politicalAffiliationCategory ===
                  DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
              )
              const democraticPeople = people.filter(
                person =>
                  person.politicalAffiliationCategory ===
                  DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
              )

              return (
                <div className="flex flex-col items-center gap-6" key={stateCode}>
                  <div className="flex flex-col items-center">
                    <PageTitle as="h3" size="xxs">
                      Primary election
                    </PageTitle>
                  </div>
                  <ResponsiveTabsOrSelect
                    analytics={'Primary Races Tabs'}
                    containerClassName="mb-6 md:mb-10"
                    data-testid="primary-races-tabs"
                    defaultValue={DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN}
                    forceDesktop
                    persistCurrentTab
                    options={[
                      {
                        value: DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
                        label: 'Republican',
                        content: (
                          <DTSIPersonHeroCardSection
                            countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE}
                            people={republicanPeople}
                          />
                        ),
                      },
                      {
                        value: DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
                        label: 'Democratic',
                        content: (
                          <DTSIPersonHeroCardSection
                            countryCode={DEFAULT_SUPPORTED_COUNTRY_CODE}
                            people={democraticPeople}
                          />
                        ),
                      },
                    ]}
                  />
                  <Button asChild variant="secondary">
                    <InternalLink
                      href={urls.locationStateSpecificGovernorRace(stateCode as USStateCode)}
                    >
                      View all
                    </InternalLink>
                  </Button>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
