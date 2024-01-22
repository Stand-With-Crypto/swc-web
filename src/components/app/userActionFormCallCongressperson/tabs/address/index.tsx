'use client'

import React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import useSWR from 'swr'

import { Button } from '@/components/ui/button'
import { TabNames } from '@/components/app/userActionFormCallCongressperson/userActionFormCallCongressperson.types'
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormErrorMessage,
  FormField,
} from '@/components/ui/form'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { trackFormSubmissionSyncErrors } from '@/utils/web/formUtils'
import { getDTSIPeopleFromAddress } from '@/hooks/useGetDTSIPeopleFromAddress'
import type { UserActionFormCallCongresspersonProps } from '@/components/app/userActionFormCallCongressperson'
import { InternalLink } from '@/components/ui/link'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { getGoogleCivicDataFromAddress } from '@/utils/shared/googleCivicInfo'
import { GENERIC_ERROR_TITLE } from '@/utils/web/errorUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon/layout'

import {
  findRepresentativeCallFormValidationSchema,
  type FindRepresentativeCallFormValues,
  getDefaultValues,
  FORM_NAME,
} from './formConfig'

interface AddressProps
  extends Pick<UserActionFormCallCongresspersonProps, 'user' | 'onFindCongressperson' | 'gotoTab'> {
  congressPersonData?: UserActionFormCallCongresspersonProps['congressPersonData']
}

export function Address({ user, onFindCongressperson, congressPersonData, gotoTab }: AddressProps) {
  const urls = useIntlUrls()

  const form = useForm<FindRepresentativeCallFormValues>({
    defaultValues: getDefaultValues({ user }),
    resolver: zodResolver(findRepresentativeCallFormValidationSchema),
  })
  const address = useWatch({
    control: form.control,
    name: 'address',
  })
  const { data: liveCongressPersonData, isLoading: isLoadingLiveCongressPersonData } =
    useCongresspersonData({ address })

  const handleNotFoundCongressperson = React.useCallback(
    (notFoundReason: string) => {
      let message = GENERIC_ERROR_TITLE

      if (notFoundReason === 'MISSING_FROM_DTSI') {
        message = 'No available representative'
      }

      form.setError('address', {
        type: 'manual',
        message,
      })
    },
    [form],
  )

  React.useEffect(() => {
    if (!liveCongressPersonData) {
      return
    }

    const { dtsiPerson } = liveCongressPersonData
    if (!dtsiPerson || 'notFoundReason' in dtsiPerson) {
      const { notFoundReason } = dtsiPerson
      return handleNotFoundCongressperson(notFoundReason)
    }

    onFindCongressperson({ ...liveCongressPersonData, dtsiPerson })
  }, [handleNotFoundCongressperson, liveCongressPersonData, onFindCongressperson])

  return (
    <UserActionFormLayout onBack={() => gotoTab(TabNames.INTRO)}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            () => gotoTab(TabNames.SUGGESTED_SCRIPT),
            trackFormSubmissionSyncErrors(FORM_NAME),
          )}
        >
          <UserActionFormLayout.Container>
            <UserActionFormLayout.Heading
              title="Find your representative"
              subtitle="Your address will be used to connect you with your representative. Stand With Crypto will never share your data with any third-parties."
            />

            <div className="pb-64">
              <FormField
                control={form.control}
                name="address"
                render={({ field: { ref: _ref, ...field } }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <GooglePlacesSelect
                        {...field}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Your full address"
                      />
                    </FormControl>
                    <FormErrorMessage />
                  </FormItem>
                )}
              />
            </div>

            <UserActionFormLayout.Footer>
              <SubmitButton
                isLoading={form.formState.isSubmitting || isLoadingLiveCongressPersonData}
                disabled={!congressPersonData}
              />

              <p className="text-sm">
                Learn more about our{' '}
                <InternalLink href={urls.privacyPolicy()} className="underline">
                  privacy policy
                </InternalLink>
              </p>
            </UserActionFormLayout.Footer>
          </UserActionFormLayout.Container>
        </form>
      </Form>
    </UserActionFormLayout>
  )
}

function SubmitButton({ isLoading, disabled }: { isLoading: boolean; disabled: boolean }) {
  return (
    <Button type="submit" disabled={isLoading || disabled}>
      {isLoading ? 'Loading...' : 'Continue'}
    </Button>
  )
}

function useCongresspersonData({ address }: FindRepresentativeCallFormValues) {
  return useSWR(address ? `useGetDTSIPeopleFromAddress-${address.description}` : null, async () => {
    const dtsiPerson = await getDTSIPeopleFromAddress(address.description)
    const civicData = await getGoogleCivicDataFromAddress(address.description)
    const addressSchema = await convertGooglePlaceAutoPredictionToAddressSchema(address)

    return { dtsiPerson, civicData, addressSchema }
  })
}
