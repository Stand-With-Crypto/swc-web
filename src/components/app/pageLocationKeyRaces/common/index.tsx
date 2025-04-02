'use client'

import { ReactNode, useEffect } from 'react'
import Balancer from 'react-wrap-balancer'
import { UserActionType } from '@prisma/client'

import { actionCreateUserActionViewKeyRaces } from '@/actions/actionCreateUserActionViewKeyRaces'
import { ContentSection } from '@/components/app/ContentSection'
import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { PACFooter } from '@/components/app/pacFooter'
import { UserAddressVoterGuideInputSection } from '@/components/app/pageLocationKeyRaces/us/locationUnitedStates/userAddressVoterGuideInput'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { Button } from '@/components/ui/button'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { PageTitle } from '@/components/ui/pageTitleText'
import {
  COUNTRY_CODE_TO_DISPLAY_NAME,
  COUNTRY_CODE_TO_LOCALE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { getActionDefaultCampaignName } from '@/utils/shared/userActionCampaigns/index'

interface LocationRacesProps {
  children: ReactNode
  countAdvocates: number
  countryCode: SupportedCountryCodes
  shouldShowVoterRegistrationButton?: boolean
}

export function LocationRaces({
  children,
  countAdvocates,
  countryCode,
  shouldShowVoterRegistrationButton,
}: LocationRacesProps) {
  useEffect(() => {
    void actionCreateUserActionViewKeyRaces({
      campaignName: getActionDefaultCampaignName(UserActionType.VIEW_KEY_RACES, countryCode),
    })
  }, [countryCode])

  return (
    <div className="space-y-20">
      <DarkHeroSection>
        <div className="space-y-6 text-center">
          <PageTitle as="h1" size="md">
            Key Races {COUNTRY_CODE_TO_DISPLAY_NAME[countryCode]}
          </PageTitle>
          <h2 className="space-y-4 font-light text-muted lg:space-y-1">
            <p>
              <Balancer>
                View the key races occurring across {COUNTRY_CODE_TO_DISPLAY_NAME[countryCode]}
                that will impact the future of crypto. Learn where politicians stand on crypto to
                make an informed decision at the ballot box.
              </Balancer>
            </p>
          </h2>
          <h3 className="text-xl font-bold">
            <FormattedNumber amount={countAdvocates} locale={COUNTRY_CODE_TO_LOCALE[countryCode]} />{' '}
            advocates in {COUNTRY_CODE_TO_DISPLAY_NAME[countryCode]}
          </h3>
          {shouldShowVoterRegistrationButton && (
            <UserActionFormVoterRegistrationDialog>
              <Button className="mt-6 w-full max-w-xs" variant="secondary">
                Make sure you're registered to vote
              </Button>
            </UserActionFormVoterRegistrationDialog>
          )}
        </div>
      </DarkHeroSection>
      <div className="space-y-20 xl:space-y-28">{children}</div>
    </div>
  )
}

export function LocationKeyRacesVoterGuideInput({
  countryCode,
}: {
  countryCode: SupportedCountryCodes
}) {
  return <UserAddressVoterGuideInputSection countryCode={countryCode} />
}
LocationRaces.VoterGuideInput = LocationKeyRacesVoterGuideInput

export function LocationKeyRacesPacFooter() {
  return <PACFooter className="container" />
}
LocationRaces.PacFooter = LocationKeyRacesPacFooter

export function LocationKeyRaces({ children }: { children: ReactNode }) {
  return <div className="container flex flex-col items-center">{children}</div>
}
LocationRaces.KeyRaces = LocationKeyRaces

export function LocationKeyRacesStates({
  children,
  countryCode,
}: {
  children: ReactNode
  countryCode: SupportedCountryCodes
}) {
  return (
    <ContentSection
      className="container"
      title={`Other races across ${COUNTRY_CODE_TO_DISPLAY_NAME[countryCode]}`}
    >
      <div className="grid grid-cols-2 gap-3 text-center md:grid-cols-3 xl:grid-cols-4">
        {children}
      </div>
    </ContentSection>
  )
}
LocationRaces.KeyRacesStates = LocationKeyRacesStates
