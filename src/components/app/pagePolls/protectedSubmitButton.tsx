'use client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { GeoGate } from '@/components/app/geoGate'
import { Button } from '@/components/ui/button'
import { COUNTRY_CODE_TO_DEMONYM } from '@/utils/shared/intl/displayNames'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function ProtectedSubmitButton({
  isDisabled,
  isMultiple,
  countryCode,
}: {
  isDisabled: boolean
  isMultiple: boolean
  countryCode: SupportedCountryCodes
}) {
  return (
    <LoginDialogWrapper
      authenticatedContent={
        <GeoGate
          countryCode={countryCode}
          unavailableContent={
            <Button disabled={isDisabled} variant="primary-cta-outline">
              This poll is intended only for {COUNTRY_CODE_TO_DEMONYM[countryCode]} advocates.
            </Button>
          }
        >
          <Button disabled={isDisabled} size="lg" type="submit" variant="primary-cta">
            {isMultiple ? 'View results' : 'Submit'}
          </Button>
        </GeoGate>
      }
    >
      <Button size="lg" variant="primary-cta">
        Log in or sign up to vote
      </Button>
    </LoginDialogWrapper>
  )
}
