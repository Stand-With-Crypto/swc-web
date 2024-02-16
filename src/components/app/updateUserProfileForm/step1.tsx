'use client'
import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserEmailAddressSource } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'

import { actionUpdateUserProfile } from '@/actions/actionUpdateUserProfile'
import { ClientAddress } from '@/clientModels/clientAddress'
import { SensitiveDataClientUserWithENSData } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { PrivacyPolicyDialog } from '@/components/app/pagePrivacyPolicy/dialog'
import { SWCMembershipDialog } from '@/components/app/updateUserProfileForm/swcMembershipDialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import {
  Form,
  FormControl,
  FormDescription,
  FormErrorMessage,
  FormField,
  FormGeneralErrorMessage,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { Input } from '@/components/ui/input'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { cn } from '@/utils/web/cn'
import {
  GenericErrorFormValues,
  trackFormSubmissionSyncErrors,
  triggerServerActionForForm,
} from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'
import { zodUpdateUserProfileFormFields } from '@/validation/forms/zodUpdateUserProfile/zodUpdateUserProfileFormFields'

const FORM_NAME = 'User Profile'
type FormValues = z.infer<typeof zodUpdateUserProfileFormFields> & GenericErrorFormValues

export function UpdateUserProfileForm({
  user,
  onSuccess,
  onSkip,
}: {
  user: SensitiveDataClientUserWithENSData & { address: ClientAddress | null }
  onSuccess: (updatedUserFields: { firstName: string; lastName: string }) => void
  onSkip?: () => void
}) {
  const router = useRouter()
  const isEmbeddedWalletUser =
    user.primaryUserEmailAddress?.source === UserEmailAddressSource.THIRDWEB_EMBEDDED_AUTH

  const defaultValues = useRef({
    isEmbeddedWalletUser,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    emailAddress: user.primaryUserEmailAddress?.emailAddress || '',
    phoneNumber: user.phoneNumber || '',
    hasOptedInToMembership: user.hasOptedInToMembership,
    hasOptedInToSms: user.hasOptedInToSms,
    address: user.address
      ? {
          description: user.address.formattedDescription,
          place_id: user.address.googlePlaceId,
        }
      : null,
  })
  const form = useForm<FormValues>({
    resolver: zodResolver(zodUpdateUserProfileFormFields),
    defaultValues: defaultValues.current,
  })
  const phoneNumberValue = form.watch('phoneNumber')
  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(async values => {
          const address = values.address
            ? await convertGooglePlaceAutoPredictionToAddressSchema(values.address).catch(e => {
                Sentry.captureException(e)
                catchUnexpectedServerErrorAndTriggerToast(e)
                return null
              })
            : null

          const result = await triggerServerActionForForm(
            {
              form,
              formName: FORM_NAME,
              analyticsProps: {
                ...(address ? convertAddressToAnalyticsProperties(address) : {}),
              },
            },
            () => actionUpdateUserProfile({ ...values, address }),
          )
          if (result.status === 'success') {
            router.refresh()
            toast.success('Profile updated', { duration: 5000 })
            const { firstName, lastName } = values
            onSuccess({ firstName, lastName })
          }
        }, trackFormSubmissionSyncErrors(FORM_NAME))}
      >
        <div>
          <PageTitle className="mb-1" size="sm">
            {hasCompleteUserProfile(user) ? 'Edit' : 'Finish'} your profile
          </PageTitle>
          <PageSubTitle className="mb-7" size="md">
            Completing your profile makes it easier for you to take action, locate your
            representative and find local events.
          </PageSubTitle>
        </div>

        <div className="space-y-4">
          {isEmbeddedWalletUser || (
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
          )}
          <div className="grid grid-cols-1 space-y-4 md:grid-cols-2 md:gap-8 md:space-y-0">
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
          </div>

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
                    placeholder="Street address"
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
                <FormLabel>Phone number</FormLabel>
                <FormControl>
                  <Input
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
          {!defaultValues.current.hasOptedInToMembership && (
            <FormField
              control={form.control}
              name="hasOptedInToMembership"
              render={({ field }) => (
                <label className="block">
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormDescription>
                      By checking this box, I agree to become a Stand With Crypto Alliance member.{' '}
                      <SWCMembershipDialog>
                        <button className="text-blue-600">Learn More</button>
                      </SWCMembershipDialog>
                      .
                    </FormDescription>
                  </FormItem>
                </label>
              )}
            />
          )}
          <Collapsible open={!!phoneNumberValue}>
            <CollapsibleContent className="AnimateCollapsibleContent">
              <FormField
                control={form.control}
                name="hasOptedInToSms"
                render={({ field }) => (
                  <label className="block">
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormDescription>
                        (Optional) Check this box to consent to receive recurring automated text
                        messages about Stand with Crypto at the phone number provided. Reply STOP to
                        stop. Msg and data rates may apply. See{' '}
                        <PrivacyPolicyDialog>
                          <button className="text-blue-600">Privacy Policy</button>
                        </PrivacyPolicyDialog>
                        .
                      </FormDescription>
                    </FormItem>
                  </label>
                )}
              />
            </CollapsibleContent>
          </Collapsible>
          <FormGeneralErrorMessage control={form.control} />
        </div>
        <div className={cn('flex gap-6', !onSkip && 'justify-center')}>
          {onSkip && (
            <Button className="w-full md:w-1/2" onClick={onSkip} variant="secondary">
              Skip
            </Button>
          )}
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
  )
}
