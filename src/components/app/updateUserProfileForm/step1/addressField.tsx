'use client'

import { useEffect, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import * as Sentry from '@sentry/nextjs'

import { SensitiveDataClientUser } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { ANALYTICS_NAME_UPDATE_USER_PROFILE_FORM } from '@/components/app/updateUserProfileForm/constants'
import {
  DEFAULT_DISCLAIMER,
  DISCLAIMERS_BY_COUNTRY_CODE,
} from '@/components/app/updateUserProfileForm/step1/constants'
import { PrivacyConsentDisclaimer } from '@/components/app/updateUserProfileForm/step1/privacyConsentDisclaimer'
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
import { useCountryCode } from '@/hooks/useCountryCode'
import { useGoogleMapsScript } from '@/hooks/useGoogleMapsScript'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { trackSectionVisible } from '@/utils/web/clientAnalytics'
import { cn } from '@/utils/web/cn'
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
  className?: string
}

export function AddressField({
  user,
  resolvedAddress,
  setResolvedAddress,
  className,
}: AddressFieldProps) {
  const form = useFormContext()
  const addressValue = useWatch({ control: form.control, name: 'address' })
  const { isLoaded } = useGoogleMapsScript()
  const countryCode = useCountryCode()

  const [shouldShowCountryCodeDisclaimer, setShouldShowCountryCodeDisclaimer] = useState(false)

  useEffect(() => {
    async function resolveAddress() {
      if (addressValue && isLoaded) {
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
  }, [addressValue, isLoaded, setResolvedAddress])

  const shouldShowConsentDisclaimer =
    shouldShowCountryCodeDisclaimer && countryCode === DEFAULT_SUPPORTED_COUNTRY_CODE

  useEffect(() => {
    if (resolvedAddress) {
      const addressCountryCode = resolvedAddress.countryCode.toLowerCase()
      const userCountryCode = user.countryCode.toLowerCase()

      const { success: isCountryCodeSupported, data: validatedAddressCountryCode } =
        zodSupportedCountryCode.safeParse(addressCountryCode)

      if (isCountryCodeSupported && validatedAddressCountryCode !== userCountryCode) {
        trackSectionVisible(
          {
            section: 'Address Field Country Code Change Disclaimer',
            sectionGroup: ANALYTICS_NAME_UPDATE_USER_PROFILE_FORM,
          },
          {
            countryCode: validatedAddressCountryCode,
          },
        )
        setShouldShowCountryCodeDisclaimer(true)
      }
    }
  }, [resolvedAddress, user.countryCode])

  return (
    <div className={cn('flex flex-col justify-center', className)}>
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem className={cn(shouldShowCountryCodeDisclaimer && 'mb-4')}>
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
      <Collapsible
        className={cn(shouldShowConsentDisclaimer && 'mb-4')}
        open={shouldShowCountryCodeDisclaimer}
      >
        <CollapsibleContent className="AnimateCollapsibleContent">
          <FormDescription className="text-center md:text-left">
            {getCountryCodeDisclaimer(resolvedAddress?.countryCode)}
          </FormDescription>
        </CollapsibleContent>
      </Collapsible>
      <PrivacyConsentDisclaimer shouldShowConsentDisclaimer={shouldShowConsentDisclaimer} />
    </div>
  )
}

function getCountryCodeDisclaimer(countryCode?: string) {
  const parsedCountryCode = zodSupportedCountryCode.safeParse(countryCode)

  return parsedCountryCode.data
    ? DISCLAIMERS_BY_COUNTRY_CODE[parsedCountryCode.data as SupportedCountryCodes]
    : DEFAULT_DISCLAIMER
}
