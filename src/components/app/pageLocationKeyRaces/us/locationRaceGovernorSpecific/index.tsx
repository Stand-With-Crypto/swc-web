'use client'

import { useEffect, useMemo } from 'react'
import { compact, isEmpty } from 'lodash-es'

import { actionCreateUserActionViewKeyRaces } from '@/actions/actionCreateUserActionViewKeyRaces'
import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { MaybeOverflowedStances } from '@/components/app/maybeOverflowedStances'
import { PACFooter } from '@/components/app/pacFooter'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ResponsiveTabsOrSelect } from '@/components/ui/responsiveTabsOrSelect'
import {
  DTSI_DistrictSpecificInformationQuery,
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { formatSpecificRoleDTSIPerson } from '@/utils/dtsi/specificRoleDTSIPerson'
import { findRecommendedCandidate } from '@/utils/shared/findRecommendedCandidate'
import {
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { USUserActionViewKeyRacesCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

interface LocationRaceGovernorSpecificProps extends DTSI_DistrictSpecificInformationQuery {
  stateCode: USStateCode
}

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

function organizeRaceSpecificPeople(people: DTSI_DistrictSpecificInformationQuery['people']) {
  const targetedRoleCategory = DTSI_PersonRoleCategory.GOVERNOR

  const formatted = people.map(x =>
    formatSpecificRoleDTSIPerson(x, {
      specificRole: targetedRoleCategory,
    }),
  )

  const partyOrder = [
    DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
    DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
    DTSI_PersonPoliticalAffiliationCategory.INDEPENDENT,
  ]

  formatted.sort((a, b) => {
    const aPartyIndex = a.politicalAffiliationCategory
      ? partyOrder.indexOf(a.politicalAffiliationCategory)
      : -1
    const bPartyIndex = b.politicalAffiliationCategory
      ? partyOrder.indexOf(b.politicalAffiliationCategory)
      : -1
    const aPersonScore = a.computedStanceScore || a.manuallyOverriddenStanceScore || 0
    const bPersonScore = b.computedStanceScore || b.manuallyOverriddenStanceScore || 0

    if (aPersonScore !== bPersonScore) {
      return bPersonScore - aPersonScore
    }

    if (a.profilePictureUrl !== b.profilePictureUrl) {
      return a.profilePictureUrl ? -1 : 1
    }

    if (aPartyIndex !== bPartyIndex) {
      return aPartyIndex - bPartyIndex
    }

    if (a.primaryRole?.roleCategory !== b.primaryRole?.roleCategory) {
      return a.primaryRole?.roleCategory === DTSI_PersonRoleCategory.PRESIDENT ? -1 : 1
    }

    return 0
  })

  return formatted
}

export function USLocationRaceGovernorSpecific({
  stateCode,
  people,
}: LocationRaceGovernorSpecificProps) {
  const groups = organizeRaceSpecificPeople(people)
  const stateDisplayName = stateCode && US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode]
  const urls = getIntlUrls(countryCode)
  const { recommended, others } = findRecommendedCandidate(groups)

  useEffect(() => {
    void actionCreateUserActionViewKeyRaces({
      campaignName: USUserActionViewKeyRacesCampaignName['H1_2025'],
      usaState: stateCode,
    })
  }, [stateCode])

  const compactedRaces = useMemo(() => {
    return compact([
      recommended && { person: recommended, isRecommended: true },
      ...others.map(person => ({ person, isRecommended: false })),
    ])
  }, [others, recommended])

  const democraticRacesData = useMemo(
    () =>
      compactedRaces.filter(
        x =>
          x.person.politicalAffiliationCategory ===
          DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
      ),
    [compactedRaces],
  )

  const republicanRacesData = useMemo(
    () =>
      compactedRaces.filter(
        x =>
          x.person.politicalAffiliationCategory ===
          DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
      ),
    [compactedRaces],
  )

  return (
    <div>
      <DarkHeroSection className="mb-10 text-center md:mb-20">
        <h2 className={'mb-4'}>
          <InternalLink className="text-gray-400" href={urls.locationKeyRaces()}>
            United States
          </InternalLink>
          {' / '}
          <LocationRaceLinkTitle stateCode={stateCode} stateDisplayName={stateDisplayName} />
        </h2>
        <div className="mb-5 flex flex-col items-center gap-4">
          <PageTitle as="h1" className="mb-4" size="md">
            {`Gubernatorial Race (${stateCode})`}
          </PageTitle>
          <PageSubTitle>November 4, 2025</PageSubTitle>
        </div>
        <UserActionFormVoterRegistrationDialog initialStateCode={stateCode}>
          <Button className="mt-6 w-full max-w-xs" variant="secondary">
            Make sure you're registered to vote
          </Button>
        </UserActionFormVoterRegistrationDialog>
      </DarkHeroSection>
      <div className="w-full divide-y-2">
        {isEmpty(democraticRacesData) && isEmpty(republicanRacesData) ? (
          <PageTitle as="h3" className="mt-20" size="sm">
            There's no races currently in {stateDisplayName}
          </PageTitle>
        ) : (
          <div className="flex flex-col items-center gap-6" key={stateCode}>
            <div className="flex flex-col items-center">
              <PageTitle as="h3" size="xxs">
                Primary election
              </PageTitle>
            </div>
            <ResponsiveTabsOrSelect
              analytics={'Primary Races Tabs'}
              containerClassName="mb-6 md:mb-10 w-full"
              data-testid="primary-races-tabs"
              defaultValue={DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN}
              forceDesktop
              persistCurrentTab
              options={[
                {
                  value: DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
                  label: 'Republican',
                  content: republicanRacesData.map(({ person, isRecommended }) => (
                    <section
                      className="mx-auto flex max-w-7xl flex-col px-6 md:flex-row"
                      key={person.id}
                    >
                      <div className="shrink-0 py-5 md:mr-16 md:border-r-2 md:py-20 md:pr-16">
                        <div className="sticky top-24 text-center">
                          <DTSIPersonHeroCard
                            countryCode={countryCode}
                            cryptoStanceGrade={DTSIFormattedLetterGrade}
                            isRecommended={isRecommended}
                            person={person}
                            subheader="role"
                          />
                        </div>
                      </div>
                      <div className="w-full md:py-20">
                        {person.stances.length ? (
                          <>
                            <PageTitle as="h3" className="mb-8 md:mb-14" size="sm">
                              {dtsiPersonFullName(person)} statements on crypto
                            </PageTitle>
                            <MaybeOverflowedStances
                              countryCode={countryCode}
                              person={person}
                              stances={person.stances}
                            />
                          </>
                        ) : (
                          <PageTitle as="h3" className="mb-8 md:mb-14" size="sm">
                            {dtsiPersonFullName(person)} has no statements on crypto.
                          </PageTitle>
                        )}
                      </div>
                    </section>
                  )),
                },
                {
                  value: DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
                  label: 'Democratic',
                  content: democraticRacesData.map(({ person, isRecommended }) => (
                    <section className="flex max-w-7xl flex-col px-6 md:flex-row" key={person.id}>
                      <div className="shrink-0 py-5 md:mr-16 md:border-r-2 md:py-20 md:pr-16">
                        <div className="sticky top-24 text-center">
                          <DTSIPersonHeroCard
                            countryCode={countryCode}
                            cryptoStanceGrade={DTSIFormattedLetterGrade}
                            isRecommended={isRecommended}
                            person={person}
                            subheader="role"
                          />
                        </div>
                      </div>
                      <div className="w-full md:py-20">
                        {person.stances.length ? (
                          <>
                            <PageTitle as="h3" className="mb-8 md:mb-14" size="sm">
                              {dtsiPersonFullName(person)} statements on crypto
                            </PageTitle>
                            <MaybeOverflowedStances
                              countryCode={countryCode}
                              person={person}
                              stances={person.stances}
                            />
                          </>
                        ) : (
                          <PageTitle as="h3" className="mb-8 md:mb-14" size="sm">
                            {dtsiPersonFullName(person)} has no statements on crypto.
                          </PageTitle>
                        )}
                      </div>
                    </section>
                  )),
                },
              ]}
            />
          </div>
        )}
      </div>
      <PACFooter className="container" />
    </div>
  )
}

function LocationRaceLinkTitle({
  stateCode,
  stateDisplayName,
}: {
  stateCode: USStateCode
  stateDisplayName: string
}) {
  if (!stateDisplayName) {
    return <span>Presidential</span>
  }

  return <span>{`Governors (${stateCode})`}</span>
}
