'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useSWR from 'swr'

import type { CallCongresspersonActionSharedData } from '@/components/app/userActionFormCallCongressperson'
import {
  CALL_FLOW_POLITICIANS_CATEGORY,
  SectionNames,
} from '@/components/app/userActionFormCallCongressperson/constants'
import { FormFields } from '@/components/app/userActionFormCallCongressperson/types'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon/layout'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormErrorMessage,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { InternalLink } from '@/components/ui/link'
import {
  formatGetDTSIPeopleFromUSAddressNotFoundReason,
  getDTSIPeopleFromUSAddress,
} from '@/hooks/useGetDTSIPeopleFromUSAddress'
import { useGoogleMapsScript } from '@/hooks/useGoogleMapsScript'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { useIsMobile } from '@/hooks/useIsMobile'
import {
  getYourPoliticianCategoryDisplayName,
  getYourPoliticianCategoryShortDisplayName,
} from '@/utils/shared/yourPoliticianCategory'
import { trackFormSubmissionSyncErrors } from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'

import {
  findRepresentativeCallFormValidationSchema,
  type FindRepresentativeCallFormValues,
  FORM_NAME,
  getDefaultValues,
} from './formConfig'

interface AddressProps
  extends Pick<
    CallCongresspersonActionSharedData,
    'user' | 'onFindCongressperson' | 'goToSection' | 'goBackSection'
  > {
  congressPersonData?: CallCongresspersonActionSharedData['congressPersonData']
  initialValues?: FormFields
  heading?: React.ReactNode
  submitButtonText?: string
}

export function Address({
  user,
  onFindCongressperson,
  congressPersonData,
  goToSection,
  goBackSection,
  initialValues,
  heading = (
    <UserActionFormLayout.Heading
      subtitle={`Your address will be used to connect you with your ${getYourPoliticianCategoryDisplayName(CALL_FLOW_POLITICIANS_CATEGORY, { maxCount: 1 })}. Stand With Crypto will never share your data with any third-parties.`}
      title={`Find your ${getYourPoliticianCategoryShortDisplayName(CALL_FLOW_POLITICIANS_CATEGORY, { maxCount: 1 })}`}
    />
  ),
  submitButtonText = 'Continue',
}: AddressProps) {
  const urls = useIntlUrls()
  const userDefaultValues = useMemo(() => getDefaultValues({ user }), [user])

  const form = useForm<FindRepresentativeCallFormValues>({
    defaultValues: {
      ...userDefaultValues,
      address: initialValues?.address || userDefaultValues.address,
    },
    resolver: zodResolver(findRepresentativeCallFormValidationSchema),
  })

  const { setError, clearErrors, control, handleSubmit, formState } = form

  const isMobile = useIsMobile({ defaultState: true })
  const initialAddressOnLoad = useRef(user?.address?.googlePlaceId)
  const inputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (!isMobile) {
      inputRef.current?.click()
    }
  }, [isMobile])

  const address = useWatch({
    control: control,
    name: 'address',
  })

  const { data: liveCongressPersonData, isLoading: isLoadingLiveCongressPersonData } =
    useCongresspersonData({ address })

  useEffect(() => {
    if (!liveCongressPersonData) {
      return
    }

    if (!('dtsiPeople' in liveCongressPersonData)) {
      setError('address', {
        type: 'manual',
        message: formatGetDTSIPeopleFromUSAddressNotFoundReason(liveCongressPersonData),
      })
      return
    } else {
      clearErrors('address')
    }

    onFindCongressperson(liveCongressPersonData)
    // request from exec - form should auto-advance once the address is filled in
    if (address?.place_id !== initialAddressOnLoad.current) {
      goToSection(SectionNames.SUGGESTED_SCRIPT)
    }
  }, [
    liveCongressPersonData,
    onFindCongressperson,
    goToSection,
    address,
    initialAddressOnLoad,
    setError,
    clearErrors,
  ])

  return (
    <Form {...form}>
      <form
        className="max-md:h-full"
        onSubmit={handleSubmit(
          () => goToSection(SectionNames.SUGGESTED_SCRIPT),
          trackFormSubmissionSyncErrors(FORM_NAME),
        )}
      >
        <UserActionFormLayout onBack={goBackSection}>
          <UserActionFormLayout.Container>
            {heading}

            <FormField
              control={control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <GooglePlacesSelect
                      {...field}
                      onChange={field.onChange}
                      placeholder="Your full address"
                      ref={inputRef}
                      value={field.value}
                    />
                  </FormControl>
                  <FormErrorMessage />
                </FormItem>
              )}
            />
          </UserActionFormLayout.Container>
          <UserActionFormLayout.Footer>
            <Button
              disabled={
                formState.isSubmitting || isLoadingLiveCongressPersonData || !congressPersonData
              }
              type="submit"
            >
              {formState.isSubmitting || isLoadingLiveCongressPersonData
                ? 'Loading...'
                : submitButtonText}
            </Button>

            <p className="text-sm">
              Learn more about our{' '}
              <InternalLink className="underline" href={urls.privacyPolicy()} tabIndex={-1}>
                privacy policy
              </InternalLink>
            </p>
          </UserActionFormLayout.Footer>
        </UserActionFormLayout>
      </form>
    </Form>
  )
}

export function ChangeAddress(props: Omit<AddressProps, 'initialValues'>) {
  return (
    <Address
      {...props}
      heading={<UserActionFormLayout.Heading title="Update your address" />}
      submitButtonText="Update"
    />
  )
}

export function useCongresspersonData({
  address,
}: {
  address?: FindRepresentativeCallFormValues['address']
}) {
  const { isLoaded } = useGoogleMapsScript()

  const result = useSWR(
    address && isLoaded ? `useCongresspersonData-${address.description}` : null,
    async () => {
      if (!address) {
        return null
      }

      const dtsiResponse = await getDTSIPeopleFromUSAddress(
        CALL_FLOW_POLITICIANS_CATEGORY,
        address.description,
      )
      if ('notFoundReason' in dtsiResponse) {
        return { notFoundReason: dtsiResponse.notFoundReason }
      }
      const addressSchema = await convertGooglePlaceAutoPredictionToAddressSchema(address)
      return { ...dtsiResponse, addressSchema }
    },
  )

  return {
    ...result,
    isLoading: !isLoaded || result.isLoading,
  }
}
