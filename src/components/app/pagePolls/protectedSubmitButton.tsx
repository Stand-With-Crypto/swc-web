'use client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { Button } from '@/components/ui/button'

export function ProtectedSubmitButton({ isDisabled }: { isDisabled: boolean }) {
  return (
    <LoginDialogWrapper
      authenticatedContent={
        <Button disabled={isDisabled} size="lg" type="submit" variant="primary-cta">
          Submit
        </Button>
      }
      bypassCountryCheck={false}
    >
      <Button disabled={isDisabled} size="lg" variant="primary-cta">
        Sign up to vote
      </Button>
    </LoginDialogWrapper>
  )
}
