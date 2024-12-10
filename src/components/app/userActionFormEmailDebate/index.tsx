'use client'
import React, { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

import { actionCreateUserActionEmailDebate } from '@/actions/actionCreateUserActionEmailDebate'
import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_DEBATE } from '@/components/app/userActionFormEmailDebate/constants'
import { UserActionEmailDebateFormFields } from '@/components/app/userActionFormEmailDebate/types'
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
import { zodUserActionFormEmailDebateFields } from '@/validation/forms/zodUserActionFormEmailDebate'

type FormValues = z.infer<typeof zodUserActionFormEmailDebateFields> & GenericErrorFormValues

export function UserActionFormEmailDebate({
  onSuccess,
  user,
  initialValues,
}: {
  user: GetUserFullProfileInfoResponse['user']
  onCancel: () => void
  onSuccess: () => void
  initialValues?: UserActionEmailDebateFormFields
}) {
  const isDesktop = useIsDesktop()
  const router = useRouter()
  const urls = useIntlUrls()
  const hasModifiedMessage = useRef(false)
  const form = useForm<FormValues>({
    resolver: zodResolver(zodUserActionFormEmailDebateFields),
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
      campaignName: UserActionEmailCampaignName.ABC_PRESIDENTIAL_DEBATE_2024,
      subject: 'Include Crypto In The Debate',
      message: getEmailMessage({
        firstName: initialValues?.firstName || user?.firstName,
        lastName: initialValues?.lastName || user?.lastName,
      }),
    },
  })

  const handleMessageChange = () => {
    if (hasModifiedMessage.current) return

    const firstName = form.getValues('firstName')
    const lastName = form.getValues('lastName')
    const newMessage = getEmailMessage({ firstName, lastName })

    form.setValue('message', newMessage)
  }

  const handleTabPressAfterCustomMessageSet = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    // This is required because some for some reason the next field is not being focused on
    // When using onBlur and form.setValue to update the message field after the user has
    // typed the firstname and/or the lastname. This is a workaround to focus the next field
    // when the users presses tab after typing the first or last name.
    // The other fields don't require this as they don't have the same behavior of calling setValue onBlur

    form.setFocus(
      e.relatedTarget?.attributes?.getNamedItem('name')?.value as
        | 'firstName'
        | 'lastName'
        | 'emailAddress'
        | 'address',
    )
  }

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
              formName: ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_DEBATE,
              analyticsProps: {
                ...(address ? convertAddressToAnalyticsProperties(address) : {}),
                'Campaign Name': values.campaignName,
                'User Action Type': UserActionType.EMAIL,
              },
              payload: { ...values, address },
            },
            payload =>
              actionCreateUserActionEmailDebate(payload).then(async actionResultPromise => {
                const actionResult = await actionResultPromise
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
        }, trackFormSubmissionSyncErrors(ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_DEBATE))}
      >
        <ScrollArea className="overflow-auto">
          <div className={cn(dialogContentPaddingStyles, 'space-y-4 md:space-y-8')}>
            <PageTitle className="mb-3" size="sm">
              Ask ABC to include crypto at the Debate
            </PageTitle>
            <PageSubTitle className="mb-7">
              Crypto deserves to be a topic at the Presidential Debate. Send a note to ABC and ask
              them to make sure that the 52 million crypto owners in America are represented on the
              debate stage.
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
                        <Input
                          placeholder="First name"
                          {...field}
                          onBlur={e => {
                            handleMessageChange()
                            handleTabPressAfterCustomMessageSet(e)
                          }}
                        />
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
                        <Input
                          placeholder="Last name"
                          {...field}
                          onBlur={e => {
                            handleMessageChange()
                            handleTabPressAfterCustomMessageSet(e)
                          }}
                        />
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

function getEmailMessage({ firstName, lastName = '' }: { firstName?: string; lastName?: string }) {
  if (!firstName) {
    return `I am one of the 52 million Americans who own cryptocurrency. Crypto can drive American innovation and global leadership by fostering strong consumer protection, creating high-skilled jobs, and strengthening our national security. Unfortunately, bad policy could push this technology overseas, and cost the U.S. nearly 4 million jobs.

Crypto owners are uniquely bipartisan - 18% Republicans, 22% Democrats, and 22% Independents hold crypto. Crypto provides access to the banking system to disenfranchised communities and communities of color and can help bolster an economy that works for everyone.

On behalf of myself and all American crypto owners, I urge you to ask the candidates their position on cryptocurrency and its place in the American economy. Bipartisan crypto legislation has already passed the House of Representatives, and more and more elected officials are coming out in support of crypto.

Giving the major Presidential candidates a chance to weigh in on this transformational technology in the first debate would go a long way towards educating the electorate and helping American crypto owners cast an informed ballot.

Thank you for your consideration.`
  }

  return `My name is ${firstName}, and I am one of the 52 million Americans who own cryptocurrency. Crypto can drive American innovation and global leadership by fostering strong consumer protection, creating high-skilled jobs, and strengthening our national security. Unfortunately, bad policy could push this technology overseas, and cost the U.S. nearly 4 million jobs.

Crypto owners are uniquely bipartisan - 18% Republicans, 22% Democrats, and 22% Independents hold crypto. Crypto provides access to the banking system to disenfranchised communities and communities of color and can help bolster an economy that works for everyone.

On behalf of myself and all American crypto owners, I urge you to ask the candidates their position on cryptocurrency and its place in the American economy. Bipartisan crypto legislation has already passed the House of Representatives, and more and more elected officials are coming out in support of crypto.

Giving the major Presidential candidates a chance to weigh in on this transformational technology in the first debate would go a long way towards educating the electorate and helping American crypto owners cast an informed ballot.

Thank you for your consideration,
${firstName} ${lastName}`
}
