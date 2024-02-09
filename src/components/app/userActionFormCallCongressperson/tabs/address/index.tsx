'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import useSWR from 'swr'

import type { UserActionFormCallCongresspersonProps } from '@/components/app/userActionFormCallCongressperson'
import { SectionNames } from '@/components/app/userActionFormCallCongressperson/constants'
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
import { getGoogleCivicDataFromAddress } from '@/utils/shared/googleCivicInfo'
import { trackFormSubmissionSyncErrors } from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon/layout'

import {
  FORM_NAME,
  findRepresentativeCallFormValidationSchema,
  getDefaultValues,
  type FindRepresentativeCallFormValues,
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
  useEffect(() => {
    form.setFocus('address')
  }, [form])
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
    }

    onFindCongressperson({ ...liveCongressPersonData, dtsiPerson })
  }, [liveCongressPersonData, onFindCongressperson, form])

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
                      value={field.value}
                    />
                  </FormControl>
                  <FormErrorMessage />
                </FormItem>
              )}
            />
          </UserActionFormLayout.Container>
          <UserActionFormLayout.Footer>
            <SubmitButton
              disabled={!congressPersonData}
              isLoading={form.formState.isSubmitting || isLoadingLiveCongressPersonData}
            />

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

function SubmitButton({ isLoading, disabled }: { isLoading: boolean; disabled: boolean }) {
  return (
    <Button disabled={isLoading || disabled} type="submit">
      {isLoading ? 'Loading...' : 'Continue'}
    </Button>
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
