'use client'

import Balancer from 'react-wrap-balancer'
import { SMSStatus } from '@prisma/client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { SMSOptInForm } from '@/components/app/sms/smsOptInForm'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useCountryCode } from '@/hooks/useCountryCode'
import { isSmsSupportedInCountry } from '@/utils/shared/sms/smsSupportedCountries'
import { cn } from '@/utils/web/cn'

export function NoEventsCTA({
  initialText,
  className,
}: {
  initialText?: string
  className?: string
}) {
  const { data, isLoading, mutate } = useApiResponseForUserFullProfileInfo()
  const countryCode = useCountryCode()
  const user = data?.user

  return (
    <div className={cn('container flex flex-col items-center gap-4', className)}>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <p className="text-center font-mono text-sm text-muted-foreground">
            <Balancer>
              {initialText}
              {user ? (
                <CTATextBySMSStatus smsStatus={user.smsStatus} />
              ) : (
                'Join Stand With Crypto and we’ll keep you updated on any events in your area.'
              )}
            </Balancer>
          </p>
          {user ? (
            <>
              {user.smsStatus === SMSStatus.NOT_OPTED_IN &&
                isSmsSupportedInCountry(countryCode) && (
                  <SMSOptInForm
                    onSuccess={({ phoneNumber }) =>
                      void mutate({
                        user: {
                          ...data!.user!,
                          phoneNumber,
                        },
                      })
                    }
                    user={user}
                  >
                    {({ form }) => (
                      <div className="mt-4">
                        <div className="flex max-w-[400px] flex-col items-center gap-4">
                          <SMSOptInForm.PhoneNumberField className="w-full" />
                          <SMSOptInForm.Footnote className="w-full" size="xs" />
                          <SMSOptInForm.SubmitButton
                            className="mt-4"
                            disabled={form.formState.isSubmitting}
                            variant="secondary"
                          />
                        </div>
                      </div>
                    )}
                  </SMSOptInForm>
                )}
            </>
          ) : (
            <LoginDialogWrapper>
              <Button variant="secondary">Sign in</Button>
            </LoginDialogWrapper>
          )}
        </>
      )}
    </div>
  )
}

function CTATextBySMSStatus({ smsStatus }: { smsStatus: SMSStatus }) {
  const countryCode = useCountryCode()

  if (isSmsSupportedInCountry(countryCode)) {
    if (smsStatus === SMSStatus.NOT_OPTED_IN) {
      return `Enter your number and we’ll keep you updated on any events in your area.`
    }

    if (
      [
        SMSStatus.OPTED_IN,
        SMSStatus.OPTED_IN_HAS_REPLIED,
        SMSStatus.OPTED_IN_PENDING_DOUBLE_OPT_IN,
      ].includes(smsStatus)
    ) {
      return `We’ll keep you updated on any events in your area.`
    }
  }

  return 'Please check back later for updates, as new events may be added soon.'
}
