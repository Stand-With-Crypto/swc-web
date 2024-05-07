'use client'

import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'

import { actionUpdateUserProfile } from '@/actions/actionUpdateUserProfile'
import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { SectionNames } from '@/components/app/userActionFormLiveEventPizzaDay/constants'
import { zodPizzaDayUserProfileFormFields } from '@/components/app/userActionFormLiveEventPizzaDay/constants/schemas'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormErrorMessage,
  FormField,
  FormGeneralErrorMessage,
  FormItem,
} from '@/components/ui/form'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { Input } from '@/components/ui/input'
import { PageTitle } from '@/components/ui/pageTitleText'
import { UseSectionsReturn } from '@/hooks/useSections'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import {
  GenericErrorFormValues,
  trackFormSubmissionSyncErrors,
  triggerServerActionForForm,
} from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'

const FORM_NAME = 'Pizza Day User Profile Form'
type FormValues = z.infer<typeof zodPizzaDayUserProfileFormFields> & GenericErrorFormValues

interface ProfileInfoSectionProps extends UseSectionsReturn<SectionNames> {
  user: GetUserFullProfileInfoResponse['user'] | null
}

export function ProfileInfoSection({ user, goToSection }: ProfileInfoSectionProps) {
  const router = useRouter()
  const defaultValues = useRef({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    emailAddress: user?.primaryUserEmailAddress?.emailAddress || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address
      ? {
          description: user.address.formattedDescription,
          place_id: user.address.googlePlaceId,
        }
      : undefined,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(zodPizzaDayUserProfileFormFields),
    defaultValues: defaultValues.current,
  })

  return (
    <div className="flex h-full flex-col">
      <PageTitle size="md" withoutBalancer>
        Fight to keep crypto in America
      </PageTitle>

      <p className="mb-2 mt-4 text-center text-muted-foreground lg:my-8">
        Join a community of over 400,000 people fighting to keep crypto in America. Get updates on
        crypto policy and local events.
      </p>

      <Form {...form}>
        <form
          className="flex h-full flex-col"
          onSubmit={form.handleSubmit(async values => {
            // const address = values.address
            //   ? await convertGooglePlaceAutoPredictionToAddressSchema(values.address).catch(e => {
            //       Sentry.captureException(e)
            //       catchUnexpectedServerErrorAndTriggerToast(e)
            //       return null
            //     })
            //   : null

            // const result = await triggerServerActionForForm(
            //   {
            //     form,
            //     formName: FORM_NAME,
            //     analyticsProps: {
            //       ...(address ? convertAddressToAnalyticsProperties(address) : {}),
            //     },
            //     payload: { ...values, address },
            //   },
            //   payload => actionUpdateUserProfile(payload),
            // )
            goToSection(SectionNames.TWEET)
            // if (result.status === 'success') {
            //   goToSection(SectionNames.TWEET)
            //   toast.success('Profile updated', { duration: 5000 })
            // }
          }, trackFormSubmissionSyncErrors(FORM_NAME))}
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
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
                  <FormControl>
                    <Input placeholder="Last name" {...field} />
                  </FormControl>
                  <FormErrorMessage />
                </FormItem>
              )}
            />

            {user?.hasEmbeddedWallet || (
              <FormField
                control={form.control}
                name="emailAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Email address" {...field} />
                    </FormControl>
                    <FormErrorMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <GooglePlacesSelect
                      {...field}
                      onChange={field.onChange}
                      placeholder="Address"
                      value={field.value}
                    />
                  </FormControl>
                  <FormErrorMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} onChange={field.onChange} />
                  </FormControl>
                  <FormErrorMessage />
                </FormItem>
              )}
            />

            <FormGeneralErrorMessage control={form.control} />
          </div>
          <div className="mt-auto flex flex-col items-center gap-4 lg:mt-8">
            <p className="text-center text-[13px] text-muted-foreground lg:text-base">
              By clicking Next, you consent to receive recurring texts from Stand With Crypto to the
              number provided. You can reply STOP to stop receiving texts. Message and data rates
              may apply.
            </p>
            <Button
              className="w-full md:w-1/2"
              disabled={form.formState.isSubmitting}
              size="lg"
              type="submit"
            >
              Next
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
