'use client'

import { SMSStatus } from '@prisma/client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { SMSOptInForm } from '@/components/app/sms/smsOptInForm'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useCountryCode } from '@/hooks/useCountryCode'
import { isSmsSupportedInCountry } from '@/utils/shared/sms/smsSupportedCountries'

export function EmptyList() {
  return (
    <div className="container mt-8 flex flex-col items-center gap-4">
      <NextImage alt="Empty folder" height={100} src="/misc/noPortfolio.svg" width={100} />
      <strong className="text-primary">No articles found</strong>

      <EmptyListCTA />
    </div>
  )
}

function EmptyListCTA() {
  const profileReq = useApiResponseForUserFullProfileInfo()
  const countryCode = useCountryCode()
  const user = profileReq.data?.user

  if (profileReq.isLoading) {
    return null
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-muted-foreground">
          Join Stand With Crypto and we’ll send you updates when relevant articles are posted
        </p>
        <LoginDialogWrapper>
          <Button variant="secondary">Sign in</Button>
        </LoginDialogWrapper>
      </div>
    )
  }

  if (isSmsSupportedInCountry(countryCode)) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-muted-foreground">
          Enter your phone number to get updates on relevant crypto news
        </p>

        <SMSOptInForm
          onSuccess={({ phoneNumber }) =>
            void profileReq.mutate({
              user: {
                ...profileReq.data!.user!,
                phoneNumber,
              },
            })
          }
          user={user}
        >
          {({ form }) => (
            <div className="space-y-2">
              <div className="flex max-w-[400px] flex-col items-center gap-4">
                <SMSOptInForm.PhoneNumberField
                  className="w-full"
                  disabled={user.smsStatus !== SMSStatus.NOT_OPTED_IN}
                />

                {user && (
                  <SMSStatusFooter
                    isSubmitting={form.formState.isSubmitting}
                    smsStatus={user.smsStatus}
                  />
                )}
              </div>
            </div>
          )}
        </SMSOptInForm>
      </div>
    )
  }

  return null
}

const CHECKMARK_SIZE = 24

function SMSStatusFooter({
  smsStatus,
  isSubmitting,
}: {
  smsStatus: SMSStatus
  isSubmitting?: boolean
}) {
  if (
    [
      SMSStatus.OPTED_IN,
      SMSStatus.OPTED_IN_HAS_REPLIED,
      SMSStatus.OPTED_IN_PENDING_DOUBLE_OPT_IN,
    ].includes(smsStatus)
  ) {
    return (
      <span className="mt-2 flex items-center gap-2 text-green-600">
        <NextImage
          alt="Green checkmark"
          height={CHECKMARK_SIZE}
          src={'/misc/checkedCircle.svg'}
          width={CHECKMARK_SIZE}
        />
        <strong className="text-sm">You’re signed up to receive text updates</strong>
      </span>
    )
  }

  if ([SMSStatus.OPTED_OUT].includes(smsStatus)) {
    return (
      <strong className="mt-2 text-sm text-red-600">
        You’ve opted out of text updates. Reply “START” to resume receiving updates.
      </strong>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <SMSOptInForm.Footnote className="w-full max-w-xl" />
      <SMSOptInForm.SubmitButton disabled={isSubmitting} variant="secondary" />
    </div>
  )
}
