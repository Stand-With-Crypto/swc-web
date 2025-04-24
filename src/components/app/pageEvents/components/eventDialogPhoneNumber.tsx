import { getCountryCallingCode } from 'libphonenumber-js'

import { SMSOptInForm, SMSOptInFormProps } from '@/components/app/sms/smsOptInForm'
import { useCountryCode } from '@/hooks/useCountryCode'
import { SUPPORTED_COUNTRY_CODES_TO_LIBPHONENUMBER_CODE } from '@/utils/shared/phoneNumber'

export function EventDialogPhoneNumber(props: Omit<SMSOptInFormProps, 'children' | 'className'>) {
  const countryCode = useCountryCode()

  return (
    <div className="flex flex-col items-center gap-4 pb-4">
      <h3 className="mt-6 font-sans text-xl font-bold">Get updates on events</h3>
      <p className="text-center font-mono text-base text-muted-foreground">
        We’ll send you text updates on this event and other similar events in your area.
      </p>

      <SMSOptInForm className="flex w-full flex-col gap-4 px-4" {...props}>
        {({ form }) => (
          <>
            <div className="flex w-full items-start gap-4">
              <div className="flex min-w-fit cursor-default items-center justify-center rounded-md border border-input bg-background px-2 py-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ">
                <span>
                  {countryCode.toLocaleUpperCase()} +
                  {getCountryCallingCode(
                    SUPPORTED_COUNTRY_CODES_TO_LIBPHONENUMBER_CODE[countryCode],
                  )}
                </span>
              </div>

              <SMSOptInForm.PhoneNumberField className="w-full" shouldAutoFocus />
            </div>

            <SMSOptInForm.Footnote className="w-full max-w-xl" size="xs" />
            <SMSOptInForm.SubmitButton className="mt-4" disabled={form.formState.isSubmitting} />
          </>
        )}
      </SMSOptInForm>
    </div>
  )
}
