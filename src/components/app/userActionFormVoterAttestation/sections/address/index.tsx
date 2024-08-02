'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useSWR from 'swr'

import { UserActionFormLayout } from '@/components/app/userActionFormCommon/layout'
import type { VoterAttestationActionSharedData } from '@/components/app/userActionFormVoterAttestation'
import { SectionNames } from '@/components/app/userActionFormVoterAttestation/constants'
import { FormFields } from '@/components/app/userActionFormVoterAttestation/types'
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
    VoterAttestationActionSharedData,
    'user' | 'onFindCongressperson' | 'goToSection' | 'goBackSection'
  > {
  congressPersonData?: VoterAttestationActionSharedData['congressPersonData']
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
      subtitle={`Your address will be used to connect you with your ${getYourPoliticianCategoryDisplayName('house', { maxCount: 1 })}. Stand With Crypto will never share your data with any third-parties.`}
      title={`Find your ${getYourPoliticianCategoryShortDisplayName('house', { maxCount: 1 })}`}
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

    if (!('dtsiPeople' in liveCongressPersonData)) {
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
      goToSection(SectionNames.PLEDGE)
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
        className="max-md:h-full"
        onSubmit={form.handleSubmit(
          () => goToSection(SectionNames.PLEDGE),
          trackFormSubmissionSyncErrors(FORM_NAME),
        )}
      >
        <UserActionFormLayout onBack={goBackSection}>
          <UserActionFormLayout.Container>
            {heading}

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
  const scriptStatus = useGoogleMapsScript()

  const result = useSWR(
    address && scriptStatus === 'ready' ? `useCongresspersonData-${address.description}` : null,
    async () => {
      if (!address) {
        return null
      }

      const dtsiResponse = await getDTSIPeopleFromAddress('house', address.description)
      if ('notFoundReason' in dtsiResponse) {
        return { notFoundReason: dtsiResponse.notFoundReason }
      }
      const addressSchema = await convertGooglePlaceAutoPredictionToAddressSchema(address)
      return { ...dtsiResponse, addressSchema }
    },
  )

  return {
    ...result,
    isLoading: scriptStatus === 'loading' || result.isLoading,
  }
}
