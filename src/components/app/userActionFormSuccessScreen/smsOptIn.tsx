import { SMSOptInForm, SMSOptInFormProps } from '@/components/app/smsOptInForm'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { Skeleton } from '@/components/ui/skeleton'

interface SMSOptInContentProps extends Omit<SMSOptInFormProps, 'children'> {}

export function SMSOptInContent(props: SMSOptInContentProps) {
  return (
    <div className="mx-auto flex h-full max-w-lg flex-col items-center gap-6 text-center">
      <UserActionFormSuccessScreenFeedback
        description="This is an important time for crypto. Sign up for occasional text updates on important legislation, elections, and events in your area."
        title="Nice work!"
      />

      <SMSOptInForm className="h-full" {...props}>
        {({ form }) => (
          <div className="flex h-full flex-col gap-2">
            <SMSOptInForm.PhoneNumberField shouldAutoFocus />

            <div className="mt-auto">
              <SMSOptInForm.Footnote className="mb-8 text-xs" />
              <SMSOptInForm.SubmitButton
                className="w-full md:max-w-[300px]"
                disabled={form.formState.isSubmitting}
                size="lg"
              >
                Get updates
              </SMSOptInForm.SubmitButton>
            </div>
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
