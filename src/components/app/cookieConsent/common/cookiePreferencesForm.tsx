import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckboxProps } from '@radix-ui/react-checkbox'
import { z } from 'zod'

import { zodManageCookieConsent } from '@/components/app/cookieConsent/common/cookieConsentSchema'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { InfoBadge } from '@/components/ui/infoBadge'
import { CookieConsentPermissions, OptionalCookieConsentTypes } from '@/utils/shared/cookieConsent'
import { GenericErrorFormValues } from '@/utils/web/formUtils'

export interface CookiePreferencesFieldConfig {
  key: OptionalCookieConsentTypes
  label: string
  helpText: string
}

interface CookiePreferencesFormProps {
  onSubmit: (accepted: CookieConsentPermissions) => void
  defaultValues: CookieConsentPermissions
  fieldsConfig: CookiePreferencesFieldConfig[]
}

type FormValues = z.infer<typeof zodManageCookieConsent> & GenericErrorFormValues

export function CookiePreferencesForm({
  onSubmit,
  defaultValues,
  fieldsConfig,
}: CookiePreferencesFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(zodManageCookieConsent),
    defaultValues,
  })

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <h3 className="font-semibold">Manage Cookies:</h3>

        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-[repeat(2,minmax(max-content,1fr))] md:gap-5 md:text-base">
          <CheckboxField
            checked
            disabled
            helpText="These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms. These also include cookies we may rely on for fraud prevention. You can set your browser to block or alert you about these cookies, but some parts of the site will not then work."
            label="Strictly necessary Cookies"
          />

          {fieldsConfig.map(({ key, label, helpText }) => (
            <FormField
              control={form.control}
              key={key}
              name={key}
              render={({ field: { value, onChange, ...field } }) => (
                <CheckboxField
                  helpText={helpText}
                  label={label}
                  {...field}
                  checked={value}
                  onCheckedChange={onChange}
                />
              )}
            />
          ))}
        </div>

        <Button className="mt-4 w-full" size="lg" type="submit">
          Save
        </Button>
      </form>
    </Form>
  )
}

interface CheckboxFieldProps extends CheckboxProps {
  label: string
  helpText: string
}

const CheckboxField = React.forwardRef<React.ComponentRef<typeof FormItem>, CheckboxFieldProps>(
  ({ label, helpText, ...props }, ref) => {
    return (
      <FormItem ref={ref}>
        <label className="flex cursor-pointer items-center gap-2">
          <FormControl>
            <Checkbox {...props} />
          </FormControl>
          <p>{label}</p>
          <InfoBadge analytics={'Cookie Preferences Info Badge'}>{helpText}</InfoBadge>
        </label>
      </FormItem>
    )
  },
)
CheckboxField.displayName = 'CheckboxField'
