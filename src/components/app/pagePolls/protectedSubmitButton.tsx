import Cookies from 'js-cookie'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { useDialog } from '@/hooks/useDialog'
import { USER_COUNTRY_CODE_COOKIE_NAME } from '@/utils/server/getCountryCode'
import { isValidCountryCode } from '@/utils/shared/isValidCountryCode'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

export function ProtectedSubmitButton({ isDisabled }: { isDisabled: boolean }) {
  const dialogProps = useDialog({ analytics: 'Active Poll Submit Button' })

  const userCountryCode = Cookies.get(USER_COUNTRY_CODE_COOKIE_NAME)
  const isValid = isValidCountryCode({
    countryCode: DEFAULT_SUPPORTED_COUNTRY_CODE,
    userCountryCode,
    bypassCountryCheck: false,
  })

  return (
    <LoginDialogWrapper
      authenticatedContent={
        isValid ? (
          <Button disabled={isDisabled} size="lg" type="submit" variant="primary-cta">
            Submit
          </Button>
        ) : (
          <Dialog {...dialogProps} onOpenChange={dialogProps.onOpenChange}>
            <DialogTrigger asChild>
              <Button disabled={isDisabled} size="lg" variant="primary-cta">
                Submit
              </Button>
            </DialogTrigger>
            <DialogContent a11yTitle="Active Poll Submit Button" className="max-w-l w-full">
              <DialogBody>
                <UserActionFormActionUnavailable />
              </DialogBody>
            </DialogContent>
          </Dialog>
        )
      }
      bypassCountryCheck={false}
    >
      <Button disabled={isDisabled} size="lg" variant="primary-cta">
        Submit
      </Button>
    </LoginDialogWrapper>
  )
}
