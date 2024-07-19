'use client'

import { useForm } from 'react-hook-form'
import Cookies from 'js-cookie'

import { useCookieConsent } from '@/components/app/cookieConsent/useCookieConsent'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormErrorMessage,
  FormField,
  FormGeneralErrorMessage,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { USER_COUNTRY_CODE_COOKIE_NAME } from '@/utils/server/getCountryCode'
import { setCookie } from '@/utils/server/setCookie'

type FormFields = {
  countryCode: string
}

export function UserConfig() {
  const { resetCookieConsent } = useCookieConsent()

  console.log('USER_COUNTRY_CODE_', Cookies.get(USER_COUNTRY_CODE_COOKIE_NAME))

  const form = useForm<FormFields>({
    defaultValues: {
      countryCode: Cookies.get(USER_COUNTRY_CODE_COOKIE_NAME),
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Label>Reset consent cookie:</Label>
        <Button
          onClick={() => {
            resetCookieConsent()

            // This is a hack to force the cookie consent banner to re-render from the layout
            window.location.reload()
          }}
        >
          Reset
        </Button>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(async values => {
            void setCookie(USER_COUNTRY_CODE_COOKIE_NAME, values.countryCode)
          })}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormErrorMessage />
                </FormItem>
              )}
            />

            <Button className="col-span-full" disabled={form.formState.isSubmitting} type="submit">
              Update
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
