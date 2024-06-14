'use client'
import React, { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

import { actionCreateUserActionEmailCNN } from '@/actions/actionCreateUserActionEmailCNN'
import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CNN } from '@/components/app/userActionFormEmailCNN/constants'
import { FormFields } from '@/components/app/userActionFormEmailCNN/types'
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
import { useIsDesktop } from '@/hooks/useIsDesktop'
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
import {
  catchUnexpectedServerErrorAndTriggerToast,
  toastGenericError,
} from '@/utils/web/toastUtils'
import { zodUserActionFormEmailCNNFields } from '@/validation/forms/zodUserActionFormEmailCNN'

type FormValues = z.infer<typeof zodUserActionFormEmailCNNFields> & GenericErrorFormValues

export function UserActionFormEmailCNN({
  onSuccess,
  user,
  initialValues,
}: {
  user: GetUserFullProfileInfoResponse['user']
  onCancel: () => void
  onSuccess: () => void
  initialValues?: FormFields
}) {
  const isDesktop = useIsDesktop()
  const router = useRouter()
  const urls = useIntlUrls()
  const hasModifiedMessage = useRef(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(zodUserActionFormEmailCNNFields),
    defaultValues: {
      address:
        initialValues?.address || user?.address?.route
          ? {
              description: user?.address?.formattedDescription,
              place_id: user?.address?.googlePlaceId,
            }
          : undefined,
      emailAddress: initialValues?.email || user?.primaryUserEmailAddress?.emailAddress || '',
      firstName: initialValues?.firstName || user?.firstName,
      lastName: initialValues?.lastName || user?.lastName,
      campaignName: UserActionEmailCampaignName.CNN_PRESIDENTIAL_DEBATE_2024,
      message: `I stand for crypto and I urge you to support crypto legislation that will establish clear regulations for the betterment of consumers, investors, developers, and beyond.

Over the past 15 years, crypto has emerged onto the world stage, and the power of crypto is being realized through an increasing number of use cases, such as cross border payments and remittances, enablement of humanitarian relief efforts, and access to funds in otherwise inaccessible situations. The potential of crypto is endless: it creates ways for creators and artists to directly receive payments and royalties, it provides pathways for aid to oppressed groups, it gives revolutionaries in totalitarian states access to uncensorable financial services, and so much more. Nonetheless, it's equally important to ensure that this potential grows in a responsible manner and adheres to regulatory standards.`,
    },
  })

  React.useEffect(() => {
    if (isDesktop) {
      form.setFocus('firstName')
    }
  }, [form, isDesktop])

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
              formName: ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CNN,
              analyticsProps: {
                ...(address ? convertAddressToAnalyticsProperties(address) : {}),
                'Campaign Name': values.campaignName,
                'User Action Type': UserActionType.EMAIL,
              },
              payload: { ...values, address },
            },
            payload =>
              actionCreateUserActionEmailCNN(payload).then(actionResult => {
                if (actionResult?.user) {
                  identifyUserOnClient(actionResult.user)
                }
                return actionResult
              }),
          )
          if (result.status === 'success') {
            router.refresh()
            onSuccess()
          } else {
            toastGenericError()
          }
        }, trackFormSubmissionSyncErrors(ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CNN))}
      >
        <ScrollArea className="overflow-auto">
          <div className={cn(dialogContentPaddingStyles, 'space-y-4 md:space-y-8')}>
            <PageTitle className="mb-3" size="sm">
              Ask CNN to feature crypto at the Presidential Debate
            </PageTitle>
            <PageSubTitle className="mb-7">
              Crypto deserves to be a presidential debate topic. Send an email to CNN and ask them
              to include questions around crypto in the debate.
            </PageSubTitle>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="First name" {...field} />
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
                        <Input placeholder="Last name" {...field} />
                      </FormControl>
                      <FormErrorMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailAddress"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
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
                          placeholder="Your address"
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
                    <div className="relative">
                      <FormControl>
                        <Textarea
                          placeholder=""
                          rows={16}
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
          className="z-10 mt-auto flex flex-col items-center justify-end border border-t p-6 sm:flex-row md:px-12"
          style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' }}
        >
          <Button
            className="w-full sm:max-w-xs"
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
