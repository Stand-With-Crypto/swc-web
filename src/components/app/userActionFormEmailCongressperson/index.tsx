'use client'
import React, { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

import { actionCreateUserActionEmailCongressperson } from '@/actions/actionCreateUserActionEmailCongressperson'
import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { DTSICongresspersonAssociatedWithFormAddress } from '@/components/app/dtsiCongresspersonAssociatedWithFormAddress'
import { ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON } from '@/components/app/userActionFormEmailCongressperson/constants'
import { getDefaultText } from '@/components/app/userActionFormEmailCongressperson/getDefaultText'
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
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { UserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns'
import { cn } from '@/utils/web/cn'
import {
  GenericErrorFormValues,
  trackFormSubmissionSyncErrors,
  triggerServerActionForForm,
} from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'
import { zodUserActionFormEmailCongresspersonFields } from '@/validation/forms/zodUserActionFormEmailCongressperson'

type FormValues = z.infer<typeof zodUserActionFormEmailCongresspersonFields> &
  GenericErrorFormValues

const getDefaultValues = ({
  user,
  dtsiSlug,
}: {
  user: GetUserFullProfileInfoResponse['user']
  dtsiSlug: string | undefined
}): Partial<FormValues> => {
  if (user) {
    return {
      campaignName: UserActionEmailCampaignName.DEFAULT,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.primaryUserEmailAddress?.emailAddress || '',
      message: getDefaultText(),
      address: user.address
        ? {
            description: user.address.formattedDescription,
            place_id: user.address.googlePlaceId,
          }
        : undefined,
    }
  }
  return {
    campaignName: UserActionEmailCampaignName.DEFAULT,
    firstName: '',
    lastName: '',
    emailAddress: '',
    message: getDefaultText(),
    address: undefined,
    dtsiSlug,
  }
}

export function UserActionFormEmailCongressperson({
  onSuccess,
  user,
  initialValues,
}: {
  user: GetUserFullProfileInfoResponse['user']
  onCancel: () => void
  onSuccess: () => void
  initialValues?: FormFields
}) {
  const router = useRouter()
  const urls = useIntlUrls()
  const defaultValues = useMemo(() => {
    const userDefaultValues = getDefaultValues({ user, dtsiSlug: undefined })

    if (initialValues) {
      const splitFullName = initialValues.fullName.split(' ')

      return {
        ...userDefaultValues,
        address: userDefaultValues.address || { description: initialValues?.address, place_id: '' },
        emailAddress: userDefaultValues.emailAddress || initialValues?.email,
        firstName: userDefaultValues.firstName || splitFullName[0],
        lastName: userDefaultValues.lastName || splitFullName.splice(1).join(' '),
      }
    }

    return userDefaultValues
  }, [initialValues, user])

  const form = useForm<FormValues>({
    resolver: zodResolver(zodUserActionFormEmailCongresspersonFields),
    defaultValues,
  })

  const formAddressField = useWatch({
    control: form.control,
    name: 'address',
  })

  React.useEffect(() => {
    form.setFocus('firstName')
  }, [form])

  return (
    <Form {...form}>
      <form
        className="flex max-h-dvh flex-col"
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
                'DTSI Slug': values.dtsiSlug,
              },
            },
            () =>
              actionCreateUserActionEmailCongressperson({ ...values, address }).then(
                actionResult => {
                  if (actionResult.user) {
                    identifyUserOnClient(actionResult.user)
                  }
                  return actionResult
                },
              ),
          )
          if (result.status === 'success') {
            router.refresh()
            onSuccess()
          }
        }, trackFormSubmissionSyncErrors(ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON))}
      >
        <ScrollArea>
          <div className={cn(dialogContentPaddingStyles, 'space-y-4 md:space-y-8')}>
            <PageTitle className="mb-3" size="sm">
              Email your congressperson
            </PageTitle>
            <PageSubTitle className="mb-7">
              Email your Congressperson and tell them to support crypto. Enter following information
              and we will generate a personalized email for you to send to your representative.
            </PageSubTitle>
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
                        defaultValue={formAddressField.description}
                        onChange={field.onChange}
                        placeholder="Your full address"
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
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="Your message..." rows={10} {...field} />
                  </FormControl>
                  <FormErrorMessage />
                </FormItem>
              )}
            />
            <FormGeneralErrorMessage control={form.control} />
            <div>
              <p className="text-xs text-fontcolor-muted">
                By submitting, I understand that Stand With Crypto and its vendors may collect and
                use my Personal Information. To learn more, visit the Stand With Crypto Alliance{' '}
                <InternalLink href={urls.privacyPolicy()} tabIndex={-1}>
                  Privacy Policy
                </InternalLink>{' '}
                and{' '}
                <ExternalLink
                  href={'https://www.quorum.us/static/Privacy-Policy.pdf'}
                  tabIndex={-1}
                >
                  Quorum Privacy Policy
                </ExternalLink>
                .
              </p>
            </div>
          </div>
        </ScrollArea>
        <div
          className="z-10 flex flex-1 flex-col items-center justify-between gap-4 border border-t p-6 sm:flex-row md:px-12"
          style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' }}
        >
          <FormField
            control={form.control}
            name="address"
            render={addressProps => (
              <FormField
                control={form.control}
                name="dtsiSlug"
                render={dtsiSlugProps => (
                  <div className="w-full">
                    <DTSICongresspersonAssociatedWithFormAddress
                      address={addressProps.field.value}
                      currentDTSISlugValue={dtsiSlugProps.field.value}
                      onChangeDTSISlug={dtsiSlugProps.field.onChange}
                    />
                    <FormErrorMessage />
                  </div>
                )}
              />
            )}
          />
          <div className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto"
              disabled={form.formState.isSubmitting || !formAddressField.place_id}
              size="lg"
              type="submit"
            >
              Send
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
