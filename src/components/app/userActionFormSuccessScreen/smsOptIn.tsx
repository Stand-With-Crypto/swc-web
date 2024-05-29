'use client'

import { SMSOptInForm, SMSOptInFormProps } from '@/components/app/smsOptInForm'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { Skeleton } from '@/components/ui/skeleton'

interface SMSOptInContentProps extends Omit<SMSOptInFormProps, 'children'> {}

export function SMSOptInContent(props: SMSOptInContentProps) {
  return (
    <div className="flex h-full flex-col gap-4 text-center">
      <UserActionFormSuccessScreenFeedback
        Image={
          <NextImage alt="Shield with checkmark" height={120} src="/logo/shield.svg" width={120} />
        }
        description="This is an important year for crypto. Sign up for occasional text updates on important legislation, elections, and events in your area."
        title="Nice work!"
      />

      <SMSOptInForm {...props}>
        {({ form }) => (
          <div className="mt-auto">
            <p className="mb-4 text-sm text-fontcolor-muted lg:mb-8">
              By clicking Get updates, I consent to receive recurring texts from Stand with Crypto.
              You can reply STOP to stop receiving texts. Message and data rates may apply.
            </p>
            <Button
              className="w-full md:max-w-[300px]"
              disabled={form.formState.isSubmitting}
              size="lg"
              type="submit"
            >
              Get updates
            </Button>
          </div>
        )}
      </SMSOptInForm>
    </div>
  )
}

SMSOptInContent.Skeleton = function SMSOptInContentSkeleton() {
  return (
    <div className="space-y-8">
      <UserActionFormSuccessScreenFeedback.Skeleton />

      <Skeleton className="mx-auto h-14 w-full max-w-[450px]" />
    </div>
  )
}
