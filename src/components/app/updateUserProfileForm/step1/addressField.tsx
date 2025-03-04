'use client'

import { useEffect, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import * as Sentry from '@sentry/nextjs'

import { SensitiveDataClientUser } from '@/clientModels/clientUser/sensitiveDataClientUser'
import {
  DEFAULT_DISCLAIMER,
  DISCLAIMERS_BY_COUNTRY_CODE,
} from '@/components/app/updateUserProfileForm/step1/constants'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import {
  FormControl,
  FormDescription,
  FormErrorMessage,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

interface AddressFieldProps {
  user: SensitiveDataClientUser
  resolvedAddress: Awaited<
    ReturnType<typeof convertGooglePlaceAutoPredictionToAddressSchema>
  > | null
  setResolvedAddress: (
    address: Awaited<ReturnType<typeof convertGooglePlaceAutoPredictionToAddressSchema>> | null,
  ) => void
}

export function AddressField({ user, resolvedAddress, setResolvedAddress }: AddressFieldProps) {
  const form = useFormContext()
  const addressValue = useWatch({ control: form.control, name: 'address' })

  const [shouldShowCountryCodeDisclaimer, setShouldShowCountryCodeDisclaimer] = useState(false)

  useEffect(() => {
    async function resolveAddress() {
      if (addressValue) {
        const newAddress = await convertGooglePlaceAutoPredictionToAddressSchema(
          addressValue,
        ).catch(e => {
          Sentry.captureException(e)
          catchUnexpectedServerErrorAndTriggerToast(e)
          return null
        })

        setResolvedAddress(newAddress)
        setShouldShowCountryCodeDisclaimer(false)
      }
    }

    void resolveAddress()
  }, [addressValue, setResolvedAddress])

  useEffect(() => {
    if (resolvedAddress) {
      const addressCountryCode = resolvedAddress.countryCode.toLowerCase()
      const userCountryCode = user.countryCode.toLowerCase()

      const { success: isCountryCodeSupported, data: validatedAddressCountryCode } =
        zodSupportedCountryCode.safeParse(addressCountryCode)

      if (isCountryCodeSupported && validatedAddressCountryCode !== userCountryCode) {
        setShouldShowCountryCodeDisclaimer(true)
      }
    }
  }, [resolvedAddress, user.countryCode])

  return (
    <div className="flex flex-col justify-center gap-4 max-md:!mt-auto md:mt-4">
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <GooglePlacesSelect
                {...field}
                onChange={field.onChange}
                placeholder="Street address"
                value={field.value}
              />
            </FormControl>
            <FormErrorMessage />
          </FormItem>
        )}
      />
      <Collapsible open={shouldShowCountryCodeDisclaimer}>
        <CollapsibleContent className="AnimateCollapsibleContent">
          <FormDescription className="text-center lg:text-left">
            {getCountryCodeDisclaimer(resolvedAddress?.countryCode)}
          </FormDescription>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function getCountryCodeDisclaimer(countryCode?: string) {
  const parsedCountryCode = zodSupportedCountryCode.safeParse(countryCode)

  return parsedCountryCode.data
    ? DISCLAIMERS_BY_COUNTRY_CODE[parsedCountryCode.data as SupportedCountryCodes]
    : DEFAULT_DISCLAIMER
}
