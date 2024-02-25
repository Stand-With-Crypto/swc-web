'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useSWR from 'swr'

import type { UserActionFormCallCongresspersonProps } from '@/components/app/userActionFormCallCongressperson'
import { SectionNames } from '@/components/app/userActionFormCallCongressperson/constants'
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
  formatGetDTSIPeopleFromAddressNotFoundReason,
  getDTSIPeopleFromAddress,
} from '@/hooks/useGetDTSIPeopleFromAddress'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { useIsMobile } from '@/hooks/useIsMobile'
import { getGoogleCivicDataFromAddress } from '@/utils/shared/googleCivicInfo'
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
    UserActionFormCallCongresspersonProps,
    'user' | 'onFindCongressperson' | 'goToSection'
  > {
  congressPersonData?: UserActionFormCallCongresspersonProps['congressPersonData']
  initialValues?: FormFields
}

export function Address({
  user,
  onFindCongressperson,
  congressPersonData,
  goToSection,
  initialValues,
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

  const isMobile = useIsMobile({ defaultState: true })
  const initialAddressOnLoad = useRef(user?.address?.googlePlaceId)
  const inputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (!isMobile) {
      inputRef.current?.click()
    }
  }, [form, isMobile])

  const address = useWatch({
    control: form.control,
    name: 'address',
  })

  const { data: liveCongressPersonData, isLoading: isLoadingLiveCongressPersonData } =
    useCongresspersonData({ address })

  React.useEffect(() => {
    if (!liveCongressPersonData) {
      return
    }

    if (!('dtsiPerson' in liveCongressPersonData)) {
      form.setError('address', {
        type: 'manual',
        message: formatGetDTSIPeopleFromAddressNotFoundReason(liveCongressPersonData),
      })
      return
    } else {
      form.clearErrors('address')
    }

    onFindCongressperson(liveCongressPersonData)
    // request from exec - form should auto-advance once the address is filled in
    if (address?.place_id !== initialAddressOnLoad.current) {
      goToSection(SectionNames.SUGGESTED_SCRIPT)
    }
  }, [
    liveCongressPersonData,
    onFindCongressperson,
    form,
    goToSection,
    address,
    initialAddressOnLoad,
  ])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          () => goToSection(SectionNames.SUGGESTED_SCRIPT),
          trackFormSubmissionSyncErrors(FORM_NAME),
        )}
      >
        <UserActionFormLayout onBack={() => goToSection(SectionNames.INTRO)}>
          <UserActionFormLayout.Container>
            <UserActionFormLayout.Heading
              subtitle="Your address will be used to connect you with your representative. Stand With Crypto will never share your data with any third-parties."
              title="Find your representative"
            />

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
                form.formState.isSubmitting ||
                isLoadingLiveCongressPersonData ||
                !congressPersonData
              }
              type="submit"
            >
              {form.formState.isSubmitting || isLoadingLiveCongressPersonData
                ? 'Loading...'
                : 'Continue'}
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

function useCongresspersonData({ address }: FindRepresentativeCallFormValues) {
  return useSWR(address ? `useCongresspersonData-${address.description}` : null, async () => {
    const dtsiResponse = await getDTSIPeopleFromAddress(address.description)
    if (dtsiResponse.notFoundReason) {
      return { notFoundReason: dtsiResponse.notFoundReason }
    }
    const addressSchema = await convertGooglePlaceAutoPredictionToAddressSchema(address)
    return { ...dtsiResponse, addressSchema }
  })
}
