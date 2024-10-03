'use client'

import { ContentSection } from '@/components/app/ContentSection'
import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { PACFooter } from '@/components/app/pacFooter'
import { UserAddressVoterGuideInputSection } from '@/components/app/pageLocationKeyRaces/locationUnitedStates/userAddressVoterGuideInput'
import { KeyRaceLiveResult } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/keyRaceLiveResult'
import { LiveStatusBadge } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/liveStatusBadge'
import { PresidentialRaceResult } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/presidentialRaceResult'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { GetElectoralCollegeResponse, GetRacesResponse } from '@/data/decisionDesk/types'
import { SupportedLocale } from '@/intl/locales'
import { normalizeDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

import { organizePeople } from './organizePeople'
import { ResultsOverviewCard } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/resultsOverviewCard'

interface LocationUnitedStatesLiveResultsProps {
  locale: SupportedLocale
  races: ReturnType<typeof organizePeople>
  ddhqResults: Record<string, GetRacesResponse>
  presidentRaceData: GetElectoralCollegeResponse
}

export function LocationUnitedStatesLiveResults({
  locale,
  races,
  ddhqResults = {},
  presidentRaceData,
}: LocationUnitedStatesLiveResultsProps) {
  const urls = getIntlUrls(locale)

  return (
    <div className="space-y-20">
      <DarkHeroSection className="bg-black py-8 lg:px-28 lg:py-20">
        <div className="flex flex-col items-center justify-between gap-10 lg:flex-row">
          <div className="space-y-6 text-center">
            <NextImage
              alt="SWC shield"
              className="mx-auto lg:mx-0"
              height={100}
              src="/actionTypeIcons/optIn.png"
              width={100}
            />
            <PageTitle as="h1" className="text-center lg:text-left" size="md">
              Crypto election updates
            </PageTitle>
            <PageSubTitle className="text-muted-foreground lg:text-left" size="lg">
              See how crypto is influencing the election. Get live election updates.
            </PageSubTitle>

            <Button asChild className="hidden w-fit font-bold lg:flex" variant="secondary">
              <InternalLink href={urls.locationUnitedStatesPresidential()}>
                View presidential race
              </InternalLink>
            </Button>
          </div>

          <PresidentialRaceResult
            candidates={races.president}
            initialRaceData={presidentRaceData}
          />

          <Button asChild className="w-full max-w-xs font-bold lg:hidden" variant="secondary">
            <InternalLink href={urls.locationUnitedStatesPresidential()}>
              View presidential race
            </InternalLink>
          </Button>
        </div>
      </DarkHeroSection>

      <div className="space-y-20 xl:space-y-28">
        <ContentSection
          className="container"
          subtitle="Follow our tracker to see how many pro-crypto candidates get elected in the United States this year."
          title="Live election results"
          titleProps={{ size: 'xs' }}
        >
          <div className="flex justify-center">
            <LiveStatusBadge status="live" />
          </div>

          <div className="flex flex-wrap gap-4">
            <ResultsOverviewCard
              antiCryptoCandidatesElected={999}
              proCryptoCandidatesElected={999}
              title="House of Representatives"
            />
            <ResultsOverviewCard
              antiCryptoCandidatesElected={999}
              proCryptoCandidatesElected={999}
              title="Senate"
            />
          </div>
        </ContentSection>

        <UserAddressVoterGuideInputSection locale={locale} />

        <ContentSection
          subtitle="These elections are critical to the future of crypto in America. View live updates below."
          title="Critical elections"
          titleProps={{ size: 'xs' }}
        >
          <section className="grid grid-cols-1 divide-x-2 divide-y-2 lg:grid-cols-2">
            {Object.entries(races.keyRaces).map(([stateCode, keyRaces]) =>
              keyRaces.map(candidates => {
                const primaryDistrict = candidates[0].runningForSpecificRole.primaryDistrict
                  ? normalizeDTSIDistrictId(candidates[0].runningForSpecificRole)
                  : undefined

                const officeId = primaryDistrict ? '3' : '4'
                const key = `${stateCode}_${primaryDistrict?.toString() || 'undefined'}_${officeId}`

                return (
                  <GridItem key={key}>
                    <KeyRaceLiveResult
                      candidates={candidates}
                      className="flex-1"
                      initialRaceData={ddhqResults[key] || undefined}
                      key={key}
                      locale={locale}
                      officeId={officeId}
                      primaryDistrict={primaryDistrict}
                      stateCode={stateCode as USStateCode}
                    />
                  </GridItem>
                )
              }),
            )}

            <GridItem>
              <div className="flex flex-col items-center justify-center gap-8 text-center">
                <NextImage
                  alt="SWC shield"
                  src="/shields/shield_DoublePurple.png"
                  width={120}
                  height={120}
                />
                <div className="space-y-2">
                  <p className="text-xl font-semibold">Did you vote in this year's election?</p>
                  <p className="text-fontcolor-muted">Claim your free "I Voted" NFT</p>
                </div>
                <Button className="w-fit">I voted!</Button>
              </div>
            </GridItem>
          </section>
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
      </div>
    </div>
  )
}

function GridItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full items-center justify-center px-6 py-10 md:px-12 md:py-14 lg:px-20">
      {children}
    </div>
  )
}
