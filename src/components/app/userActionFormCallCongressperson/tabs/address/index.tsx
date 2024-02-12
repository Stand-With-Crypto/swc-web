'use client'

import React, { useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useSWR from 'swr'

import type { UserActionFormCallCongresspersonProps } from '@/components/app/userActionFormCallCongressperson'
import { SectionNames } from '@/components/app/userActionFormCallCongressperson/constants'
import { UserActionFormCallCongresspersonLayout } from '@/components/app/userActionFormCallCongressperson/tabs/layout'
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
}

export function Address({
  user,
  onFindCongressperson,
  congressPersonData,
  goToSection,
}: AddressProps) {
  const urls = useIntlUrls()
  const form = useForm<FindRepresentativeCallFormValues>({
    defaultValues: getDefaultValues({ user }),
    resolver: zodResolver(findRepresentativeCallFormValidationSchema),
  })
  const isMobile = useIsMobile({ defaultState: true })
  const initialAddressOnLoad = useRef(user?.address?.googlePlaceId)
  const inputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    form.setFocus('address')
    // we only want the input to auto-open on desktop
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

    const { dtsiPerson } = liveCongressPersonData
    if (!dtsiPerson || 'notFoundReason' in dtsiPerson) {
      form.setError('address', {
        type: 'manual',
        message: formatGetDTSIPeopleFromAddressNotFoundReason(dtsiPerson),
      })
      return
    } else {
      form.clearErrors('address')
    }

    onFindCongressperson({ ...liveCongressPersonData, dtsiPerson })
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
        <UserActionFormCallCongresspersonLayout onBack={() => goToSection(SectionNames.INTRO)}>
          <UserActionFormCallCongresspersonLayout.Container>
            <UserActionFormCallCongresspersonLayout.Heading
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
          </UserActionFormCallCongresspersonLayout.Container>
          <UserActionFormCallCongresspersonLayout.Footer>
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
          </UserActionFormCallCongresspersonLayout.Footer>
        </UserActionFormCallCongresspersonLayout>
      </form>
    </Form>
  )
}

function useCongresspersonData({ address }: FindRepresentativeCallFormValues) {
  return useSWR(address ? `useCongresspersonData-${address.description}` : null, async () => {
    const dtsiPerson = await getDTSIPeopleFromAddress(address.description)
    const civicData = await getGoogleCivicDataFromAddress(address.description)
    const addressSchema = await convertGooglePlaceAutoPredictionToAddressSchema(address)

    return { dtsiPerson, civicData, addressSchema }
  })
}
