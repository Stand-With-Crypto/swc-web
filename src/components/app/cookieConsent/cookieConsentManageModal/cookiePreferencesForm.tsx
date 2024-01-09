import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GenericErrorFormValues } from '@/utils/web/formUtils'
import {
  CookieConsentPermissions,
  OptionalCookieConsentTypes,
  zodManageCookieConsent,
} from '@/components/app/cookieConsent/cookieConsent.constants'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'

export interface CookiePreferencesFormProps {
  onSubmit: (accepted: CookieConsentPermissions) => void
}

type FormValues = z.infer<typeof zodManageCookieConsent> & GenericErrorFormValues

export function CookiePreferencesForm({ onSubmit: _ }: CookiePreferencesFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(zodManageCookieConsent),
    defaultValues: {
      [OptionalCookieConsentTypes.PERFORMANCE]: true,
      [OptionalCookieConsentTypes.FUNCTIONAL]: true,
      [OptionalCookieConsentTypes.TARGETING]: true,
    },
  })

  const handleValidSubmission = console.log

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleValidSubmission)}>
        <h3 className="text-lg font-semibold md:text-base">Manage Cookies:</h3>

        <div className="grid grid-rows-1 md:grid-rows-2">
          <FormField
            control={form.control}
            name={OptionalCookieConsentTypes.PERFORMANCE}
            render={({ field: { value, ...field } }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      {...field}
                      checked={!value}
                      onCheckedChange={val => field.onChange(!val)}
                    />
                  </FormControl>
                  <p>Anonymous</p>
                </div>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  )
}
