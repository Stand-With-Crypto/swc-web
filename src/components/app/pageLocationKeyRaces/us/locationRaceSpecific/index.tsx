import { compact, isEmpty } from 'lodash-es'

import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { MaybeOverflowedStances } from '@/components/app/maybeOverflowedStances'
import { DarkHeroSection } from '@/components/app/pageLocationKeyRaces/common/darkHeroSection'
import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common/locationRaces'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/ui/pageTitleText'
import {
  DTSI_DistrictSpecificInformationQuery,
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'
import { NormalizedDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
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

interface USLocationRaceSpecificProps extends DTSI_DistrictSpecificInformationQuery {
  stateCode: USStateCode
  district?: NormalizedDTSIDistrictId
  isGovernor?: boolean
}

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE
const urls = getIntlUrls(countryCode)

function organizeRaceSpecificPeople(
  people: DTSI_DistrictSpecificInformationQuery['people'],
  { district, stateCode }: Pick<USLocationRaceSpecificProps, 'district' | 'stateCode'>,
) {
  let targetedRoleCategory = DTSI_PersonRoleCategory.PRESIDENT

  if (district) {
    targetedRoleCategory = DTSI_PersonRoleCategory.CONGRESS
  } else if (stateCode) {
    targetedRoleCategory = DTSI_PersonRoleCategory.SENATE
  }

  const formatted = people.map(x =>
    formatSpecificRoleDTSIPerson(x, {
      specificRole: targetedRoleCategory,
    }),
  )

  const partyOrder = [
    DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
    DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
    DTSI_PersonPoliticalAffiliationCategory.INDEPENDENT,
  ]

  formatted.sort((a, b) => {
    const lastNameA = a.lastName
    const lastNameB = b.lastName

    if (lastNameA !== lastNameB) {
      return lastNameA.localeCompare(lastNameB)
    }

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

export function USLocationRaceSpecific({
  stateCode,
  district,
  people,
}: USLocationRaceSpecificProps) {
  const groups = organizeRaceSpecificPeople(people, { district, stateCode })
  const stateDisplayName = stateCode && US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode]
  const { recommended, others } = findRecommendedCandidate(groups)

  const racesData = compact([
    recommended && { person: recommended, isRecommended: true },
    ...others.map(person => ({ person, isRecommended: false })),
  ])

  return (
    <LocationRaces disableVerticalSpacing>
      <LocationRaces.ActionRegisterer
        input={{
          campaignName: USUserActionViewKeyRacesCampaignName['H1_2025'],
          usaState: stateCode,
          usCongressionalDistrict: district?.toString(),
          countryCode,
        }}
      />

      <DarkHeroSection className="text-center">
        <DarkHeroSection.Breadcrumbs
          sections={getBreadcrumbSections({
            href: urls.locationKeyRaces(),
            stateCode,
            stateDisplayName,
            district,
          })}
        />

        <DarkHeroSection.Title>
          {!stateCode
            ? 'U.S. Presidential Race'
            : district
              ? `${stateCode} Congressional District ${district}`
              : `U.S. Senate (${stateCode})`}
        </DarkHeroSection.Title>

        <UserActionFormVoterRegistrationDialog initialStateCode={stateCode}>
          <Button className="mt-6 w-full max-w-xs" variant="secondary">
            Make sure you're registered to vote
          </Button>
        </UserActionFormVoterRegistrationDialog>
      </DarkHeroSection>

      <div className="divide-y-2">
        {isEmpty(racesData) ? (
          <LocationRaces.EmptyMessage gutterTop>
            There's no key races currently in {stateDisplayName}
          </LocationRaces.EmptyMessage>
        ) : (
          racesData.map(({ person, isRecommended }) => (
            <div key={person.id}>
              <section className="mx-auto flex max-w-7xl flex-col px-6 md:flex-row">
                <div className="shrink-0 py-10 md:mr-16 md:border-r-2 md:py-20 md:pr-16">
                  <div className="sticky top-24 text-center">
                    <DTSIPersonHeroCard
                      countryCode={countryCode}
                      cryptoStanceGrade={DTSIFormattedLetterGrade}
                      isRecommended={isRecommended}
                      person={person}
                      shouldHideStanceScores={false}
                      subheader="role"
                    />
                  </div>
                </div>
                <div className="w-full py-10 md:py-20">
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
                    <div className="flex h-full w-full items-center justify-center text-center">
                      <h3 className="text-xl md:text-2xl">
                        {dtsiPersonFullName(person)} has no statements on crypto.
                      </h3>
                    </div>
                  )}
                </div>
              </section>
            </div>
          ))
        )}
      </div>
      <LocationRaces.PacFooter />
    </LocationRaces>
  )
}

function getBreadcrumbSections({
  href,
  stateCode,
  stateDisplayName,
  district,
}: {
  href: string
  stateCode: USStateCode
  stateDisplayName?: string
  district?: NormalizedDTSIDistrictId
}) {
  const sections: { name: string; url?: string }[] = [
    { name: 'United States', url: getIntlUrls(countryCode).locationKeyRaces() },
  ]

  if (!stateDisplayName) {
    sections.push({ name: 'Presidential' })
    return sections
  }

  sections.push({ name: stateDisplayName, url: href })

  if (district) {
    sections.push({ name: `${stateCode} Congressional District ${district}` })
  } else {
    sections.push({ name: `U.S. Senate (${stateCode})` })
  }

  return sections
}
