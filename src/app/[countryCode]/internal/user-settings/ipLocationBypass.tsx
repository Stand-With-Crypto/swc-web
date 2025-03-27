import { useForm } from 'react-hook-form'
import Cookies from 'js-cookie'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormErrorMessage,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  BYPASS_IP_LOCATION_COOKIE_NAME,
  USER_COUNTRY_CODE_COOKIE_NAME,
} from '@/utils/server/getCountryCode'
import { COOKIE_CONSENT_COOKIE_NAME } from '@/utils/shared/cookieConsent'
import { LOCAL_USER_CURRENT_SESSION_KEY, LOCAL_USER_PERSISTED_KEY } from '@/utils/shared/localUser'
import { USER_SELECTED_COUNTRY_COOKIE_NAME } from '@/utils/shared/supportedCountries'
import { USER_SESSION_ID_COOKIE_NAME } from '@/utils/shared/userSessionId'

type FormFields = {
  locationCountryCode: string
}

export function IpLocationBypass() {
  const form = useForm<FormFields>({
    defaultValues: {
      locationCountryCode: '',
    },
  })

  const handleLocationCountryCodeSubmit = async (values: FormFields) => {
    Cookies.set(BYPASS_IP_LOCATION_COOKIE_NAME, values.locationCountryCode)

    Cookies.remove(USER_COUNTRY_CODE_COOKIE_NAME)
    Cookies.remove(COOKIE_CONSENT_COOKIE_NAME)
    Cookies.remove(LOCAL_USER_PERSISTED_KEY)
    Cookies.remove(LOCAL_USER_CURRENT_SESSION_KEY)
    Cookies.remove(USER_SESSION_ID_COOKIE_NAME)
    Cookies.remove(USER_SELECTED_COUNTRY_COOKIE_NAME)

    toast.success('IP location country code bypassed. Please, open a new tab to see the changes.', {
      duration: 10000,
    })
  }

  const handleLocationCountryCodeReset = async () => {
    Cookies.remove(BYPASS_IP_LOCATION_COOKIE_NAME)

    toast.success('IP location country code bypass removed!', {
      duration: 10000,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleLocationCountryCodeSubmit)}>
        <div className="flex items-end gap-4">
          <FormField
            control={form.control}
            name="locationCountryCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IP Location Country Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  This will bypass the IP location lookup and return the country code as the one you
                  enter. It will also delete all necessary cookies to simulate a first time visitor.
                </FormDescription>
                <FormErrorMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="mt-4 flex gap-4">
          <Button disabled={form.formState.isSubmitting} type="submit">
            Update
          </Button>
          <Button
            disabled={form.formState.isSubmitting}
            onClick={handleLocationCountryCodeReset}
            type="button"
            variant="secondary"
          >
            Clear bypass
          </Button>
        </div>
      </form>
    </Form>
  )
}
