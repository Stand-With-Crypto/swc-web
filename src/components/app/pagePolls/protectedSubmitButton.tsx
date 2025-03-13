'use client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { Button } from '@/components/ui/button'

export function ProtectedSubmitButton({
  isDisabled,
  isMultiple,
}: {
  isDisabled: boolean
  isMultiple: boolean
}) {
  return (
    <LoginDialogWrapper
      authenticatedContent={
        <Button disabled={isDisabled} size="lg" type="submit" variant="primary-cta">
          {isMultiple ? 'View results' : 'Submit'}
        </Button>
      }
      bypassCountryCheck={false}
    >
      <Button size="lg" variant="primary-cta">
        Log in or sign up to vote
      </Button>
    </LoginDialogWrapper>
  )
}
