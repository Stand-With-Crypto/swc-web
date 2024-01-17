'use client'

import React from 'react'
import { SubmitHandler, useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { useTabsContext } from '@/hooks/useTabs'
import { TabNames } from '@/components/app/userActionFormCallCongressperson/userActionFormCallCongressperson.types'
import { UserActionFormCallCongresspersonLayout } from '@/components/app/userActionFormCallCongressperson/tabs/layout'
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
import type { UserActionFormCallCongresspersonTabsContext } from '@/components/app/userActionFormCallCongressperson'
import { InternalLink } from '@/components/ui/link'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { getGoogleCivicDataFromAddress } from '@/utils/shared/googleCivicInfo'

import {
  findRepresentativeCallFormValidationSchema,
  type FindRepresentativeCallFormValues,
  getDefaultValues,
  FORM_NAME,
} from './formConfig'

export function Address({
  user,
  onFindCongressperson,
}: UserActionFormCallCongresspersonTabsContext) {
  const urls = useIntlUrls()
  const { gotoTab } = useTabsContext<TabNames>()

  const form = useForm<FindRepresentativeCallFormValues>({
    defaultValues: getDefaultValues({ user }),
    resolver: zodResolver(findRepresentativeCallFormValidationSchema),
  })

  const handleNotFoundCongressperson = React.useCallback((notFoundReason: string) => {
    let message = 'Something went wrong. Please try again later.'

    if (notFoundReason === 'MISSING_FROM_DTSI') {
      message = 'No available representative'
    }

    form.setError('address', {
      type: 'manual',
      message,
    })
  }, [])

  const handleValidSubmission: SubmitHandler<FindRepresentativeCallFormValues> = React.useCallback(
    async ({ address }) => {
      // Don't use Promise.all here, the first function caches a request for the second one
      // So if we use Promise.all we'll make two requests instead of one
      const dtsiPerson = await getDTSIPeopleFromAddress(address.description)
      const civicData = await getGoogleCivicDataFromAddress(address.description)

      if ('notFoundReason' in dtsiPerson) {
        const { notFoundReason } = dtsiPerson as { notFoundReason: string }
        handleNotFoundCongressperson(notFoundReason)
      }

      onFindCongressperson({ dtsiPerson, civicData })
      gotoTab(TabNames.SUGGESTED_SCRIPT)
    },
    [handleNotFoundCongressperson, gotoTab, onFindCongressperson],
  )

  return (
    <UserActionFormCallCongresspersonLayout onBack={() => gotoTab(TabNames.INTRO)}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            handleValidSubmission,
            trackFormSubmissionSyncErrors(FORM_NAME),
          )}
        >
          <UserActionFormCallCongresspersonLayout.Container>
            <UserActionFormCallCongresspersonLayout.Heading
              title="Find your representative"
              subtitle="Your address will be used to connect you with your representative. Stand With Crypto will never share your data with any third-parties."
            />

            <div className="pb-64">
              <FormField
                control={form.control}
                name="address"
                render={({ field: { ref, ...field } }) => (
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

            <UserActionFormCallCongresspersonLayout.Footer>
              <SubmitButton />

              <p className="text-sm">
                Learn more about our{' '}
                <InternalLink href={urls.privacyPolicy()} className="underline">
                  privacy policy
                </InternalLink>
              </p>
            </UserActionFormCallCongresspersonLayout.Footer>
          </UserActionFormCallCongresspersonLayout.Container>
        </form>
      </Form>
    </UserActionFormCallCongresspersonLayout>
  )
}

function SubmitButton() {
  const { formState } = useFormContext()
  return (
    <Button type="submit" disabled={formState.isSubmitting}>
      {formState.isSubmitting ? 'Loading...' : 'Continue'}
    </Button>
  )
}
