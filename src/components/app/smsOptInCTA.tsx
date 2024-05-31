'use client'

import { SMSOptInForm, SMSOptInFormProps } from '@/components/app/smsOptInForm'

interface SMSOptInProps extends Omit<SMSOptInFormProps, 'children'> {}

export function SMSOptInCTA(props: SMSOptInProps) {
  return (
    <SMSOptInForm {...props}>
      {({ form }) => (
        <div className="space-y-2">
          <div className="flex flex-col flex-wrap gap-4 sm:flex-row">
            <SMSOptInForm.PhoneNumberField className="flex-1" />

            <SMSOptInForm.SubmitButton
              className="flex-0 self-start rounded-md"
              disabled={form.formState.isSubmitting}
              size="lg"
              variant="primary-cta"
            >
              Get updates
            </SMSOptInForm.SubmitButton>
          </div>

          <SMSOptInForm.Footnote />
        </div>
      )}
    </SMSOptInForm>
  )
}
