import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { ContentSection } from '@/components/app/ContentSection'
import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { DDHQFooter } from '@/components/app/ddhqFooter'
import { PACFooter } from '@/components/app/pacFooter'
import { LiveResultsGrid } from '@/components/app/pageLocationKeyRaces/liveResultsGrid'
import { KeyRaceLiveResult } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/keyRaceLiveResult'
import { LiveResultsMap } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/liveResultsMap'
import { LiveStatusBadgeWithApi } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/liveStatusBadgeWithApi'
import { PresidentialRaceResult } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/presidentialRaceResult'
import { ResultsOverviewCard } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/resultsOverviewCard'
import { getCongressLiveResultOverview } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/utils'
import { UserActionVotingDayDialog } from '@/components/app/userActionVotingDay/dialog'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import {
  GetAllCongressDataResponse,
  PresidentialDataWithVotingResponse,
  RacesVotingDataResponse,
} from '@/data/aggregations/decisionDesk/types'
import { SupportedLocale } from '@/intl/locales'
import { normalizeDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { DecisionDeskRedisKeys } from '@/utils/server/decisionDesk/cachedData'
import { AllCompletedRacesResponse } from '@/utils/server/decisionDesk/getElectionStatus'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

import { organizePeople } from './organizePeople'

interface LocationUnitedStatesLiveResultsProps {
  locale: SupportedLocale
  dtsiResults: ReturnType<typeof organizePeople>
  ddhqResults: Record<DecisionDeskRedisKeys, RacesVotingDataResponse[] | null>
  presidentialRaceLiveResult: PresidentialDataWithVotingResponse[] | null
  congressRaceLiveResult: GetAllCongressDataResponse
  initialElectionStatusData: AllCompletedRacesResponse
}

export function LocationUnitedStatesLiveResults({
  locale,
  dtsiResults,
  ddhqResults,
  presidentialRaceLiveResult,
  congressRaceLiveResult,
  initialElectionStatusData,
}: LocationUnitedStatesLiveResultsProps) {
  const urls = getIntlUrls(locale)

  const senateElectedData = getCongressLiveResultOverview(congressRaceLiveResult.senateDataWithDtsi)
  const houseElectedData = getCongressLiveResultOverview(congressRaceLiveResult.houseDataWithDtsi)

  return (
    <div className="space-y-20">
      <DarkHeroSection className="py-8 lg:px-28 lg:py-20">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col items-center justify-between gap-6 text-center md:px-8">
          <NextImage
            alt="SWC shield"
            className="mx-auto"
            height={100}
            src="/actionTypeIcons/optIn.png"
            width={100}
          />
          <div className="space-y-4 text-center">
            <PageTitle as="h1" className="text-center" size="md">
              Crypto election updates
            </PageTitle>
            <PageSubTitle className="text-gray-400" size="lg">
              Get live election results and see where the winners stand on crypto policy.
            </PageSubTitle>
          </div>

          <LoginDialogWrapper
            authenticatedContent={
              <UserActionVotingDayDialog>
                <Button className="mt-6 w-full max-w-xs" variant="secondary">
                  Claim "I Voted" NFT
                </Button>
              </UserActionVotingDayDialog>
            }
          >
            <Button className="w-fit" variant="secondary">
              Join Stand With Crypto
            </Button>
          </LoginDialogWrapper>
        </div>
      </DarkHeroSection>

      <div className="space-y-20 xl:space-y-28">
        <ContentSection
          className="container"
          subtitle="See where each candidate stands on crypto and get live updates on the presidential election."
          title="Presidential race"
          titleProps={{ size: 'xs' }}
        >
          <div className="flex w-full justify-center">
            <PresidentialRaceResult
              candidates={dtsiResults.president}
              initialRaceData={presidentialRaceLiveResult}
              locale={locale}
            />
          </div>
        </ContentSection>

        <ContentSection
          className="container"
          subtitle="Follow our tracker to see how many pro-crypto candidates get elected in the United States this year."
          title="Live election results"
          titleProps={{ size: 'xs' }}
        >
          <div className="flex justify-center">
            <LiveStatusBadgeWithApi initialElectionStatusData={initialElectionStatusData} />
          </div>

          <div className="flex flex-col flex-wrap items-center gap-4 lg:flex-row">
            <ResultsOverviewCard
              antiCryptoCandidatesElected={houseElectedData.antiCryptoCandidatesElected.length}
              link={getIntlUrls(locale).locationCongressHouse()}
              proCryptoCandidatesElected={houseElectedData.proCryptoCandidatesElected.length}
              title="House of Representatives"
            />
            <ResultsOverviewCard
              antiCryptoCandidatesElected={senateElectedData.antiCryptoCandidatesElected.length}
              link={getIntlUrls(locale).locationCongressSenate()}
              proCryptoCandidatesElected={senateElectedData.proCryptoCandidatesElected.length}
              title="Senate"
            />
          </div>
        </ContentSection>

        <ContentSection
          className="container hidden lg:block"
          subtitle="When a state turns purple, it means a pro-crypto candidate has been elected. Follow along to see which states vote pro-crypto."
          title="Map view"
          titleProps={{ size: 'xs' }}
        >
          <div className="flex justify-center">
            <LiveStatusBadgeWithApi initialElectionStatusData={initialElectionStatusData} />
          </div>
          <LiveResultsMap initialRaceData={congressRaceLiveResult} locale={locale} />
        </ContentSection>

        <ContentSection
          subtitle="These elections are critical to the future of crypto in America. View live updates below."
          title="Critical elections"
          titleProps={{ size: 'xs' }}
        >
          <LiveResultsGrid>
            {Object.entries(dtsiResults.keyRaces).flatMap(([stateCode, keyRaces]) =>
              keyRaces.map(candidates => {
                const primaryDistrict = candidates[0].runningForSpecificRole.primaryDistrict
                  ? normalizeDTSIDistrictId(candidates[0].runningForSpecificRole)
                  : undefined

                const key: DecisionDeskRedisKeys = `SWC_${stateCode?.toUpperCase() as USStateCode}_STATE_RACES_DATA`

                return (
                  <LiveResultsGrid.GridItem key={key + primaryDistrict}>
                    <KeyRaceLiveResult
                      candidates={candidates}
                      className="flex-1"
                      initialRaceData={ddhqResults[key] || undefined}
                      locale={locale}
                      primaryDistrict={primaryDistrict}
                      stateCode={stateCode as USStateCode}
                    />
                  </LiveResultsGrid.GridItem>
                )
              }),
            )}

            <LiveResultsGrid.GridItem>
              <div className="flex w-full max-w-xl flex-col items-center justify-center gap-8 text-center">
                <NextImage
                  alt="SWC shield"
                  height={120}
                  src="/shields/shield_DoublePurple.png"
                  width={120}
                />
                <LoginDialogWrapper
                  authenticatedContent={
                    <>
                      <div className="space-y-2">
                        <p className="text-xl font-semibold">
                          Did you vote in this year's election?
                        </p>
                        <p className="text-fontcolor-muted">Claim your free "I Voted" NFT</p>
                      </div>
                      <UserActionVotingDayDialog>
                        <Button className="mt-6 w-full max-w-xs" variant="secondary">
                          Claim "I Voted" NFT
                        </Button>
                      </UserActionVotingDayDialog>
                    </>
                  }
                >
                  <div>
                    <div className="space-y-2">
                      <p className="text-xl font-semibold">Did you vote in this year's election?</p>
                      <p className="text-fontcolor-muted">
                        Now take the next step and sign up to join Stand With Crypto
                      </p>
                    </div>
                    <Button className="mt-8 w-fit">Join Stand With Crypto</Button>
                  </div>
                </LoginDialogWrapper>
              </div>
            </LiveResultsGrid.GridItem>
          </LiveResultsGrid>
        </ContentSection>

        <ContentSection
          className="container"
          subtitle="Dive deeper and discover races in other states across America."
          title="Other states"
        >
          <div className="grid grid-cols-2 gap-3 text-center md:grid-cols-3 xl:grid-cols-4">
            {Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP).map(_stateCode => {
              const stateCode = _stateCode as USStateCode
              return (
                <InternalLink
                  className={cn('mb-4 block flex-shrink-0 font-semibold')}
                  href={urls.locationStateSpecific(stateCode)}
                  key={stateCode}
                >
                  {US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode]}
                </InternalLink>
              )
            })}
          </div>
        </ContentSection>

        <PACFooter className="container text-center" />
        <DDHQFooter className="container text-center" />
      </div>
    </div>
  )
}
