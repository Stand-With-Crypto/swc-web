'use client'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'

import { actionUpdateUserProfile } from '@/actions/actionUpdateUserProfile'
import { ClientAddress } from '@/clientModels/clientAddress'
import { SensitiveDataClientUser } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { SWCMembershipDialog } from '@/components/app/updateUserProfileForm/swcMembershipDialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormErrorMessage,
  FormField,
  FormGeneralErrorMessage,
  FormItem,
} from '@/components/ui/form'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { Input } from '@/components/ui/input'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import {
  GenericErrorFormValues,
  trackFormSubmissionSyncErrors,
  triggerServerActionForForm,
} from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'
import { zodUpdateUserProfileWithRequiredFormFields } from '@/validation/forms/zodUpdateUserProfile/zodUpdateUserProfileFormFields'

const FORM_NAME = 'User Profile'
type FormValues = z.infer<typeof zodUpdateUserProfileWithRequiredFormFields> &
  GenericErrorFormValues

export function UpdateUserProfileForm({
  user,
  onSuccess,
}: {
  user: SensitiveDataClientUser & { address: ClientAddress | null }
  onSuccess: (updatedUserFields: { firstName: string; lastName: string }) => void
}) {
  const router = useRouter()
  const defaultValues = useRef({
    isEmbeddedWalletUser: user.hasEmbeddedWallet,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    emailAddress: user.primaryUserEmailAddress?.emailAddress || '',
    phoneNumber: user.phoneNumber || '',
    hasOptedInToMembership: user.hasOptedInToMembership,
    hasOptedInToSms: true,
    address: user.address
      ? {
          description: user.address.formattedDescription,
          place_id: user.address.googlePlaceId,
        }
      : undefined,
  })
  const form = useForm<FormValues>({
    resolver: zodResolver(zodUpdateUserProfileWithRequiredFormFields),
    defaultValues: defaultValues.current,
  })

  return (
    <Form {...form}>
      <form
        className="flex h-full flex-col gap-6 md:gap-4 md:px-8"
        onSubmit={form.handleSubmit(async values => {
          const address = await convertGooglePlaceAutoPredictionToAddressSchema(
            values.address,
          ).catch(e => {
            Sentry.captureException(e)
            catchUnexpectedServerErrorAndTriggerToast(e)
            return null
          })

          const result = await triggerServerActionForForm(
            {
              form,
              formName: FORM_NAME,
              analyticsProps: {
                ...(address ? convertAddressToAnalyticsProperties(address) : {}),
              },
              payload: { ...values, address },
            },
            payload => actionUpdateUserProfile(payload),
          )
          if (result.status === 'success') {
            router.refresh()
            toast.success('Profile updated', { duration: 5000 })
            const { firstName, lastName } = values
            onSuccess({ firstName, lastName })
          }
        }, trackFormSubmissionSyncErrors(FORM_NAME))}
      >
        <div className="flex flex-col gap-8">
          <video
            autoPlay
            className="self-center overflow-hidden rounded-2xl"
            height={150}
            loop
            muted
            preload="auto"
            src="/swc-logo-video.mp4"
            width={150}
          />
          <div className="flex flex-col gap-1 md:mb-2">
            <PageTitle size="sm">Create an account. Get an NFT.</PageTitle>
            <PageSubTitle size="md">
              We'll send you a free membership NFT for joining Stand With Crypto.
            </PageSubTitle>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input className="h-auto p-4" placeholder="First name" {...field} />
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
                  <Input className="h-auto p-4" placeholder="Last name" {...field} />
                </FormControl>
                <FormErrorMessage />
              </FormItem>
            )}
          />
          {user.hasEmbeddedWallet || (
            <FormField
              control={form.control}
              name="emailAddress"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input className="h-auto p-4" placeholder="Email" {...field} />
                  </FormControl>
                  <FormErrorMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    className="h-auto p-4"
                    data-testid="phone-number-input"
                    placeholder="Phone number"
                    {...field}
                    onChange={e => {
                      field.onChange(e)
                      if (!e.target.value && form.getValues('hasOptedInToSms')) {
                        form.setValue('hasOptedInToSms', false)
                      }
                    }}
                  />
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
                <FormControl>
                  <GooglePlacesSelect
                    {...field}
                    className="h-auto py-4"
                    onChange={field.onChange}
                    placeholder="Address"
                    showIcon={false}
                    value={field.value}
                  />
                </FormControl>
                <FormErrorMessage />
              </FormItem>
            )}
          />

          {!defaultValues.current.hasOptedInToMembership && (
            <FormField
              control={form.control}
              name="hasOptedInToMembership"
              render={({ field }) => (
                <label className="block">
                  <FormItem>
                    <div className="mt-2 flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormDescription>
                        By checking this box, I agree to become a Stand With Crypto Alliance member.{' '}
                        <SWCMembershipDialog>
                          <button className="text-primary-cta">Learn More</button>
                        </SWCMembershipDialog>
                        .
                      </FormDescription>
                    </div>
                    <FormErrorMessage />
                  </FormItem>
                </label>
              )}
            />
          )}
          <FormGeneralErrorMessage control={form.control} />
        </div>
        <div className="mt-auto flex flex-col justify-center gap-4 md:mt-0">
          <Button className="w-full" disabled={form.formState.isSubmitting} size="lg" type="submit">
            Create account
          </Button>
          <p className="text-center text-xs font-normal leading-4 text-muted-foreground">
            By clicking Create account, you consent to receive recurring texts from Stand with
            Crypto about its efforts at the number provided. You can reply STOP to stop receiving
            texts. Message and data rates may apply.
          </p>
        </div>
      </form>
    </Form>
  )
}
