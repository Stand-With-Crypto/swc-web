'use client'

import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import Cookies from 'js-cookie'

import { useCookieConsent } from '@/components/app/cookieConsent/useCookieConsent'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormErrorMessage,
  FormField,
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
  const [decreaseCommunicationTimers, setDecreaseCommunicationTimers] = useCookieState(
    'SWC_DECREASE_COMMUNICATION_TIMERS',
  )

  const form = useForm<FormFields>({
    defaultValues: {
      countryCode: Cookies.get(USER_COUNTRY_CODE_COOKIE_NAME),
    },
  })

  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-center gap-4">
        <Label>Reset consent cookie:</Label>
        <Button
          onClick={() => {
            resetCookieConsent()

            // This is a hack to force the cookie consent banner to re-render from the layout
            window.location.reload()
          }}
          size="sm"
        >
          Reset
        </Button>
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <Checkbox
          checked={decreaseCommunicationTimers === 'true'}
          onCheckedChange={val => {
            setDecreaseCommunicationTimers(String(val))
          }}
        />
        <p className="leading-4">Decrease User Communication Journey timers</p>
      </label>

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

function useCookieState(cookieName: string): [string | undefined, (newValue: string) => void] {
  const [value, setStateValue] = useState(() => Cookies.get(cookieName))

  const setValue = useCallback(
    (newValue: string) => {
      Cookies.set(cookieName, newValue)
      setStateValue(newValue)
    },
    [cookieName],
  )

  return [value, setValue]
}
