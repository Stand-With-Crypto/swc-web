'use client'

import { ReactNode, useEffect } from 'react'
import Balancer from 'react-wrap-balancer'

import { actionCreateUserActionViewKeyRaces } from '@/actions/actionCreateUserActionViewKeyRaces'
import { DarkHeroSection } from '@/components/app/darkHeroSection'
import { PACFooter } from '@/components/app/pacFooter'
import { UserActionFormVoterRegistrationDialog } from '@/components/app/userActionFormVoterRegistration/dialog'
import { Button } from '@/components/ui/button'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { PageTitle } from '@/components/ui/pageTitleText'
import {
  COUNTRY_CODE_TO_DISPLAY_NAME,
  COUNTRY_CODE_TO_LOCALE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

interface LocationKeyRacesContainerProps {
  keyRaces: ReactNode
  countAdvocates: number
  countryCode: SupportedCountryCodes
  keyRacesStates?: ReactNode
  voterGuideInput?: ReactNode
  shouldShowVoterRegistrationButton?: boolean
  shouldShowPACFooter?: boolean
}

export function LocationKeyRacesContainer({
  keyRaces,
  countAdvocates,
  countryCode,
  keyRacesStates,
  voterGuideInput,
  shouldShowPACFooter,
  shouldShowVoterRegistrationButton,
}: LocationKeyRacesContainerProps) {
  useEffect(() => {
    void actionCreateUserActionViewKeyRaces()
  }, [])

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
      <div className="space-y-20 xl:space-y-28">
        {voterGuideInput}
        {keyRaces}
        {keyRacesStates}
        {shouldShowPACFooter && <PACFooter className="container" />}
      </div>
    </div>
  )
}
