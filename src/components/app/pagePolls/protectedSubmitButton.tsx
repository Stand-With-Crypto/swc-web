'use client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { GeoGate } from '@/components/app/geoGate'
import { Button } from '@/components/ui/button'
import { useCountryCode } from '@/hooks/useCountryCode'
import { COUNTRY_CODE_TO_DEMONYM } from '@/utils/shared/intl/displayNames'

export function ProtectedSubmitButton({
  isDisabled,
  isMultiple,
}: {
  isDisabled: boolean
  isMultiple: boolean
}) {
  const countryCode = useCountryCode()

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
