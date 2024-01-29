'use client'
import { actionUpdateUserProfile } from '@/actions/actionUpdateUserProfile'
import { ClientAddress } from '@/clientModels/clientAddress'
import { SensitiveDataClientUserWithENSData } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { PrivacyPolicyDialog } from '@/components/app/pagePrivacyPolicy/dialog'
import { SWCMembershipDialog } from '@/components/app/updateUserProfileForm/swcMembershipDialog'
import { hasAllFormFieldsOnUserForUpdateUserProfileForm } from '@/components/app/updateUserProfileForm/hasAllFormFieldsOnUser'
import { UserAvatar } from '@/components/app/userAvatar'
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
  FormLabel,
} from '@/components/ui/form'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { Input } from '@/components/ui/input'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { sleep } from '@/utils/shared/sleep'
import {
  GenericErrorFormValues,
  trackFormSubmissionSyncErrors,
  triggerServerActionForForm,
} from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'
import { zodUpdateUserProfileFormFields } from '@/validation/forms/zodUpdateUserProfile'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserEmailAddressSource } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const FORM_NAME = 'User Profile'
type FormValues = z.infer<typeof zodUpdateUserProfileFormFields> & GenericErrorFormValues

export function UpdateUserProfileForm({
  user,
  onCancel,
  onSuccess,
}: {
  user: SensitiveDataClientUserWithENSData & { address: ClientAddress | null }
  onCancel: () => void
  onSuccess: () => void
}) {
  const router = useRouter()
  const isEmbeddedWalletUser =
    user.primaryUserEmailAddress?.source === UserEmailAddressSource.THIRDWEB_EMBEDDED_AUTH
  const form = useForm<FormValues>({
    resolver: zodResolver(zodUpdateUserProfileFormFields),
    defaultValues: {
      isEmbeddedWalletUser,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.primaryUserEmailAddress?.emailAddress || '',
      phoneNumber: user.phoneNumber,
      hasOptedInToMembership: user.hasOptedInToMembership,
      hasOptedInToSms: user.hasOptedInToSms,
      address: user.address
        ? {
            description: user.address.formattedDescription,
            place_id: user.address.googlePlaceId,
          }
        : null,
    },
  })
  return (
    <div>
      <div className="text-center">
        <UserAvatar user={user} size={60} />
      </div>
      <PageTitle size="sm" className="mb-1">
        {hasAllFormFieldsOnUserForUpdateUserProfileForm(user) ? 'Edit' : 'Finish'} your profile
      </PageTitle>
      <PageSubTitle size="md" className="mb-7">
        Completing your profile makes it easier for you to take action, locate your representative
        and find local events.
      </PageSubTitle>
      <Form {...form}>
        <form
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
              // give the page a sec to refresh before jumping to the next step
              sleep(2000)
              toast.success('Profile updated', { duration: 5000 })
              onSuccess()
            }
          }, trackFormSubmissionSyncErrors(FORM_NAME))}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 gap-4">
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
              name="address"
              render={({ field }) => (
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
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number</FormLabel>
                  <FormControl>
                    <Input placeholder="Your phone number" {...field} />
                  </FormControl>
                  <FormErrorMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hasOptedInToMembership"
              render={({ field }) => (
                <label>
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormDescription>
                      (Optional) By checking this box, I agree to become a Stand With Crypto
                      Alliance member.{' '}
                      <SWCMembershipDialog>
                        <button className="text-blue-600">Learn More</button>
                      </SWCMembershipDialog>
                      .
                    </FormDescription>
                  </FormItem>
                </label>
              )}
            />

            <FormField
              control={form.control}
              name="hasOptedInToSms"
              render={({ field }) => (
                <label>
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
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
          </div>
          <FormGeneralErrorMessage control={form.control} />
          <div className="space-y-4">
            <Button
              size="lg"
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full"
            >
              Submit
            </Button>
            <Button
              onClick={onCancel}
              size="lg"
              variant="secondary"
              disabled={form.formState.isSubmitting}
              className="w-full"
            >
              Skip
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
