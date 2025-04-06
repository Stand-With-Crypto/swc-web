import { isEmpty } from 'lodash-es'

import { ContentSection } from '@/components/app/ContentSection'
import { DTSIPersonHeroCardSection } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import { DTSIStanceDetails } from '@/components/app/dtsiStanceDetails'
import { DarkHeroSection } from '@/components/app/pageLocationKeyRaces/common/darkHeroSection'
import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common/locationRaces'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { Button } from '@/components/ui/button'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { ResponsiveTabsOrSelect } from '@/components/ui/responsiveTabsOrSelect'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonStanceType,
  DTSI_StateSpecificInformationQuery,
} from '@/data/dtsi/generated'
import { US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP } from '@/utils/shared/locationSpecificPages'
import { getUSStateNameFromStateCode, USStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { USUserActionViewKeyRacesCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

import { organizeStateSpecificPeople } from './organizeStateSpecificPeople'
import { UserLocationRaceInfo } from './userLocationRaceInfo'

interface LocationStateSpecificProps extends DTSI_StateSpecificInformationQuery {
  stateCode: USStateCode
  countAdvocates: number
}

const countryCode = SupportedCountryCodes.US

export function USLocationStateSpecific({
  stateCode,
  congress,
  governor,
  countAdvocates,
}: LocationStateSpecificProps) {
  const stances = congress
    .flatMap(x => x.stances)
    .filter(x => x.stanceType === DTSI_PersonStanceType.TWEET)
  const groups = organizeStateSpecificPeople(congress, governor)
  const urls = getIntlUrls(countryCode)
  const stateName = getUSStateNameFromStateCode(stateCode)

  const republicanGovernors = groups.governors.filter(
    x => x.politicalAffiliationCategory === DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
  )
  const democraticGovernors = groups.governors.filter(
    x => x.politicalAffiliationCategory === DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
  )

  return (
    <LocationRaces disableVerticalSpacing>
      <LocationRaces.ActionRegisterer
        input={{
          campaignName: USUserActionViewKeyRacesCampaignName['H1_2025'],
          countryCode,
          usaState: stateCode,
        }}
      />

      <DarkHeroSection>
        <DarkHeroSection.Breadcrumbs
          sections={[
            {
              name: 'United States',
              url: urls.locationKeyRaces(),
            },
            {
              name: stateName,
            },
          ]}
        />

        <DarkHeroSection.Title>Key Races in {stateName}</DarkHeroSection.Title>

        {countAdvocates > 1000 && (
          <DarkHeroSection.HighlightedText>
            <FormattedNumber amount={countAdvocates} locale={COUNTRY_CODE_TO_LOCALE[countryCode]} />{' '}
            crypto advocates
          </DarkHeroSection.HighlightedText>
        )}

        <div className="mt-6">
          {stateCode === 'MI' ? (
            <Button asChild className="w-full max-w-xs" variant="secondary">
              <ExternalLink href="https://mvic.sos.state.mi.us/Voter/Index">
                Find your poll location
              </ExternalLink>
            </Button>
          ) : (
            <UserActionFormVoterRegistrationDialog initialStateCode={stateCode}>
              <Button className="w-full max-w-xs" variant="secondary">
                Make sure you're registered to vote
              </Button>
            </UserActionFormVoterRegistrationDialog>
          )}
        </div>
      </DarkHeroSection>

      {isEmpty(groups.senators) && isEmpty(groups.congresspeople) && isEmpty(groups.governors) ? (
        <LocationRaces.EmptyMessage gutterTop>
          There's no key races currently in {stateName}
        </LocationRaces.EmptyMessage>
      ) : (
        <div className="space-y-20">
          {!!groups.governors && (
            <div className="mt-20">
              <ResponsiveTabsOrSelect
                analytics={'Primary Races Tabs'}
                containerClassName="mb-6 md:mb-10 w-full"
                data-testid="primary-races-tabs"
                defaultValue={DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN}
                forceDesktop
                options={[
                  {
                    value: DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
                    label: 'Republican',
                    content: (
                      <div className="sticky top-24 text-center">
                        <DTSIPersonHeroCardSection
                          countryCode={countryCode}
                          cta={
                            <InternalLink href={urls.locationStateSpecificGovernorRace(stateCode)}>
                              View Race
                            </InternalLink>
                          }
                          people={republicanGovernors}
                          title={<>{stateName} Gubernatorial Election</>}
                        />
                      </div>
                    ),
                  },
                  {
                    value: DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
                    label: 'Democratic',
                    content: (
                      <div className="sticky top-24 text-center">
                        <DTSIPersonHeroCardSection
                          countryCode={countryCode}
                          cta={
                            <InternalLink href={urls.locationStateSpecificGovernorRace(stateCode)}>
                              View Race
                            </InternalLink>
                          }
                          people={democraticGovernors}
                          title={<>{stateName} Gubernatorial Election</>}
                        />
                      </div>
                    ),
                  },
                ]}
                persistCurrentTab
              />
            </div>
          )}
          {!!groups.senators.length && (
            <div className="mt-20">
              <DTSIPersonHeroCardSection
                countryCode={countryCode}
                cta={
                  <InternalLink href={urls.locationStateSpecificSenateRace(stateCode)}>
                    View Race
                  </InternalLink>
                }
                people={groups.senators}
                title={<>U.S. Senate Race ({stateCode})</>}
              />
            </div>
          )}
          {!!groups.congresspeople['at-large']?.people.length ? (
            <div className="mt-20">
              <DTSIPersonHeroCardSection
                countryCode={countryCode}
                cta={
                  <InternalLink
                    href={urls.locationDistrictSpecific({ stateCode, district: 'at-large' })}
                  >
                    View Race
                  </InternalLink>
                }
                people={groups.congresspeople['at-large'].people}
                title={<>At-Large Congressional District</>}
              />
            </div>
          ) : (
            !isEmpty(groups.congresspeople) && (
              <UserLocationRaceInfo groups={groups} stateCode={stateCode} stateName={stateName} />
            )
          )}
          {!!stances.length && (
            <ContentSection
              subtitle={
                <>Keep up with recent tweets about crypto from politicians in {stateName}.</>
              }
              title={<>What politicians in {stateCode} are saying</>}
            >
              <ScrollArea>
                <div className="flex justify-center gap-5 pb-3 pl-4">
                  {stances.map(stance => {
                    return (
                      <div
                        className="flex w-[300px] shrink-0 flex-col lg:w-[500px]"
                        key={stance.id}
                      >
                        <DTSIStanceDetails
                          bodyClassName="line-clamp-6"
                          className="flex-grow"
                          countryCode={countryCode}
                          hideImages
                          person={stance.person}
                          stance={stance}
                        />
                      </div>
                    )
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </ContentSection>
          )}
          {US_LOCATION_PAGES_LIVE_KEY_DISTRICTS_MAP[stateCode]?.map(district => {
            const districtPeople = groups.congresspeople[district]?.people
            if (!districtPeople) {
              return null
            }
            return (
              <DTSIPersonHeroCardSection
                countryCode={countryCode}
                cta={
                  <InternalLink href={urls.locationDistrictSpecific({ stateCode, district })}>
                    View Race
                  </InternalLink>
                }
                key={district}
                people={districtPeople}
                title={<>Congressional District {district}</>}
              />
            )
          })}
          <LocationRaces.PacFooter />
        </div>
      )}
    </LocationRaces>
  )
}
