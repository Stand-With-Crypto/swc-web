import { useForm } from 'react-hook-form'
import Balancer from 'react-wrap-balancer'
import { zodResolver } from '@hookform/resolvers/zod'
import { getCountryCallingCode } from 'libphonenumber-js'

import {
  actionUpdateUserHasOptedInToSMS,
  UpdateUserHasOptedInToSMSPayload,
} from '@/actions/actionUpdateUserHasOptedInSMS'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormErrorMessage, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCountryCode } from '@/hooks/useCountryCode'
import { SUPPORTED_COUNTRY_CODES_TO_LIBPHONENUMBER_CODE } from '@/utils/shared/phoneNumber'
import { trackFormSubmissionSyncErrors, triggerServerActionForForm } from '@/utils/web/formUtils'
import { zodUpdateUserHasOptedInToSMS } from '@/validation/forms/zodUpdateUserHasOptedInToSMS'

interface EventDialogPhoneNumberProps {
  onSuccess: () => Promise<void>
}

export function EventDialogPhoneNumber({ onSuccess }: EventDialogPhoneNumberProps) {
  const countryCode = useCountryCode()

  const form = useForm<UpdateUserHasOptedInToSMSPayload>({
    resolver: zodResolver(zodUpdateUserHasOptedInToSMS(countryCode)),
    defaultValues: {
      phoneNumber: '',
    },
  })

  return (
    <div className="flex flex-col items-center gap-4 pb-4">
      <h3 className="mt-6 font-sans text-xl font-bold">Get updates on events</h3>
      <p className="text-center font-mono text-base text-muted-foreground">
        We’ll send you text updates on this event and other similar events in your area.
      </p>

      <Form {...form}>
        <form
          className="flex w-full flex-col gap-4 px-4"
          onSubmit={form.handleSubmit(async values => {
            const result = await triggerServerActionForForm(
              {
                formName: 'EventDialogPhoneNumber',
                payload: values,
              },
              payload => actionUpdateUserHasOptedInToSMS({ phoneNumber: payload.phoneNumber }),
            )

            if (result.status === 'success') {
              await onSuccess()
            }
          }, trackFormSubmissionSyncErrors('EventDialogPhoneNumber'))}
        >
          <div className="flex w-full items-start gap-4">
            <div className="flex min-w-fit cursor-default items-center justify-center rounded-md border border-input bg-background px-2 py-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ">
              <span>
                {countryCode.toLocaleUpperCase()} +
                {getCountryCallingCode(SUPPORTED_COUNTRY_CODES_TO_LIBPHONENUMBER_CODE[countryCode])}
              </span>
            </div>

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field: { ...field } }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      autoFocus
                      className="h-14  p-4 text-base"
                      placeholder="Enter phone number"
                      {...field}
                    />
                  </FormControl>
                  <FormErrorMessage />
                </FormItem>
              )}
            />
          </div>

          <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
            Get updates
          </Button>
        </form>
      </Form>

      <p className="text-center font-mono text-xs text-muted-foreground">
        <Balancer>
          By clicking Get updates, you consent to receive recurring texts from Stand with Crypto to
          the number you gave to Coinbase. You can reply STOP to stop receiving texts. Message and
          data rates may apply.
        </Balancer>
      </p>
    </div>
  )
}
