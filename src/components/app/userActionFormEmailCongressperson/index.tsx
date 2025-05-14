'use client'
import React, { useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { noop } from 'lodash-es'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

import { actionCreateUserActionEmailCongressperson } from '@/actions/actionCreateUserActionEmailCongressperson'
import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { DTSICongresspersonAssociatedWithFormAddress } from '@/components/app/dtsiCongresspersonAssociatedWithFormAddress'
import { useEmailActionCampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/campaigns'
import { ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON } from '@/components/app/userActionFormEmailCongressperson/constants'
import { FormFields } from '@/components/app/userActionFormEmailCongressperson/types'
import { Button } from '@/components/ui/button'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import {
  Form,
  FormControl,
  FormErrorMessage,
  FormField,
  FormGeneralErrorMessage,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { Input } from '@/components/ui/input'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useCountryCode } from '@/hooks/useCountryCode'
import { useGetDTSIPeopleFromAddress } from '@/hooks/useGetDTSIPeopleFromAddress'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory'
import { cn } from '@/utils/web/cn'
import {
  GenericErrorFormValues,
  trackFormSubmissionSyncErrors,
  triggerServerActionForForm,
} from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import {
  catchUnexpectedServerErrorAndTriggerToast,
  toastGenericError,
} from '@/utils/web/toastUtils'
import { zodUserActionFormEmailCongresspersonFields } from '@/validation/forms/zodUserActionFormEmailCongressperson'

export type EmailActionFormValues = z.infer<typeof zodUserActionFormEmailCongresspersonFields> &
  GenericErrorFormValues

interface UserActionFormEmailCongresspersonProps {
  user: GetUserFullProfileInfoResponse['user']
  onCancel: () => void
  onSuccess: () => void
  initialValues?: FormFields
  politicianCategory?: YourPoliticianCategory
  campaignName: USUserActionEmailCampaignName
}

export function UserActionFormEmailCongressperson({
  onSuccess,
  user,
  initialValues,
  campaignName,
}: UserActionFormEmailCongresspersonProps) {
  const isDesktop = useIsDesktop()
  const router = useRouter()
  const urls = useIntlUrls()
  const countryCode = useCountryCode()
  const hasModifiedMessage = useRef(false)
  const campaignMetadata = useEmailActionCampaignMetadata(campaignName)

  const userAddress = user?.address?.route
    ? {
        description: user.address.formattedDescription,
        place_id: user.address.googlePlaceId,
      }
    : undefined
  const form = useForm<EmailActionFormValues>({
    resolver: zodResolver(zodUserActionFormEmailCongresspersonFields),
    defaultValues: {
      campaignName: campaignMetadata.campaignName,
      contactMessage: campaignMetadata.getEmailBodyText({
        firstName: user?.firstName,
        lastName: user?.lastName,
        address: user?.address?.formattedDescription,
      }),
      subject: campaignMetadata.subject,
      politicianCategory: campaignMetadata.politicianCategory,
      firstName: initialValues?.firstName || user?.firstName || '',
      lastName: initialValues?.lastName || user?.lastName || '',
      emailAddress: initialValues?.email || user?.primaryUserEmailAddress?.emailAddress || '',
      address: initialValues?.address || userAddress,
      dtsiSlugs: [],
    },
  })
  const { setFocus } = form
  const dtsiSlugs = useWatch({
    control: form.control,
    name: 'dtsiSlugs',
  })

  const addressField = form.watch('address')

  const dtsiPeopleFromAddressResponse = useGetDTSIPeopleFromAddress(
    campaignMetadata.politicianCategory,
    addressField?.description,
  )

  const dtsiPeople = useMemo(() => {
    return dtsiPeopleFromAddressResponse?.data && 'dtsiPeople' in dtsiPeopleFromAddressResponse.data
      ? dtsiPeopleFromAddressResponse.data.dtsiPeople
      : []
  }, [dtsiPeopleFromAddressResponse?.data])

  useEffect(() => {
    if (isDesktop) {
      setFocus('firstName')
    }
  }, [isDesktop, setFocus])

  useEffect(() => {
    if (dtsiPeople.length === 0) form.setValue('dtsiSlugs', [])

    const currentSlugs = form.getValues('dtsiSlugs')

    if (!dtsiPeople?.some((person, index) => person.slug !== currentSlugs[index])) return

    const newDtsiSlugs = dtsiPeople.map(person => person.slug)
    form.setValue('dtsiSlugs', newDtsiSlugs)
  }, [dtsiPeople, form])

  const firstName = useWatch({
    control: form.control,
    name: 'firstName',
  })
  const lastName = useWatch({
    control: form.control,
    name: 'lastName',
  })

  useEffect(() => {
    if (hasModifiedMessage.current) return

    form.setValue(
      'contactMessage',
      campaignMetadata.getEmailBodyText({
        firstName,
        lastName,
        address: addressField?.description,
      }),
    )
  }, [firstName, lastName, addressField, form, campaignMetadata])

  return (
    <Form {...form}>
      <form
        className="flex h-full flex-col"
        onSubmit={form.handleSubmit(async values => {
          const address = await convertGooglePlaceAutoPredictionToAddressSchema(
            values.address,
          ).catch(e => {
            Sentry.captureException(e)
            catchUnexpectedServerErrorAndTriggerToast(e)
            return null
          })
          if (!address) {
            return
          }
          const result = await triggerServerActionForForm(
            {
              form,
              formName: ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON,
              analyticsProps: {
                ...(address ? convertAddressToAnalyticsProperties(address) : {}),
                'Campaign Name': values.campaignName,
                'User Action Type': UserActionType.EMAIL,
                'DTSI Slug': values.dtsiSlugs[0],
                'DTSI Slugs': values.dtsiSlugs,
              },
              payload: { ...values, address },
              onError: (_, error) => {
                form.setError('FORM_ERROR', {
                  message: error.message,
                })
                toastGenericError()
              },
            },
            payload =>
              actionCreateUserActionEmailCongressperson(payload).then(async actionResultPromise => {
                const actionResult = await actionResultPromise
                if (actionResult && 'user' in actionResult && actionResult.user) {
                  identifyUserOnClient(actionResult.user)
                }
                return actionResult
              }),
          )
          if (result.status === 'success') {
            router.refresh()
            onSuccess()
          }
        }, trackFormSubmissionSyncErrors(ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON))}
      >
        <ScrollArea className="overflow-auto">
          <div className={cn(dialogContentPaddingStyles, 'space-y-4 md:space-y-8')}>
            <PageTitle className="mb-3" size="sm">
              {campaignMetadata.dialogTitle}
            </PageTitle>
            <PageSubTitle className="mb-7">{campaignMetadata.dialogSubtitle}</PageSubTitle>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your first name" {...field} />
                      </FormControl>
                      <FormErrorMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your last name" {...field} />
                      </FormControl>
                      <FormErrorMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emailAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Your email" {...field} />
                      </FormControl>
                      <FormErrorMessage />
                    </FormItem>
                  )}
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
                          shouldLimitUSAddresses
                          value={field.value}
                        />
                      </FormControl>
                      <FormErrorMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={addressProps => (
                  <div className="w-full">
                    <DTSICongresspersonAssociatedWithFormAddress
                      address={addressProps.field.value}
                      countryCode={countryCode}
                      dtsiPeopleFromAddressResponse={dtsiPeopleFromAddressResponse}
                      onChangeAddress={noop}
                      politicianCategory={campaignMetadata.politicianCategory}
                    />
                  </div>
                )}
              />
              <FormField
                control={form.control}
                name="contactMessage"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      {!dtsiSlugs.length && (
                        <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-background/90">
                          <p className="text-bold max-w-md text-center">
                            Enter your address to generate a personalized message.
                          </p>
                        </div>
                      )}
                      <FormControl>
                        <Textarea
                          autoComplete="off"
                          autoCorrect="off"
                          placeholder=""
                          rows={16}
                          spellCheck={false}
                          {...field}
                          onChange={e => {
                            hasModifiedMessage.current = true
                            field.onChange(e)
                          }}
                        />
                      </FormControl>
                    </div>
                    <FormErrorMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormGeneralErrorMessage control={form.control} />
            <div>
              <p className="text-xs text-fontcolor-muted">
                By submitting, I understand that Stand With Crypto and its vendors may collect and
                use my personal information subject to the{' '}
                <InternalLink href={urls.privacyPolicy()}>SWC Privacy Policy</InternalLink> and the{' '}
                <ExternalLink href={'https://www.quorum.us/privacy-policy/'}>
                  Quorum Privacy Policy
                </ExternalLink>
                .
              </p>
            </div>
          </div>
        </ScrollArea>
        <div
          className="z-10 mt-auto flex flex-col items-center justify-center border border-t p-6 sm:flex-row md:px-12"
          style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' }}
        >
          <Button
            className="w-full sm:max-w-md"
            disabled={form.formState.isSubmitting}
            size="lg"
            type="submit"
          >
            Send
          </Button>
        </div>
      </form>
    </Form>
  )
}
