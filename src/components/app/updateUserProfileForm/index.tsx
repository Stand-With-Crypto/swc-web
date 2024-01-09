'use client'
import { actionUpdateUserProfile } from '@/actions/actionUpdateUserProfile'
import { ClientAddress } from '@/clientModels/clientAddress'
import { SensitiveDataClientUser } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { RecentActivityRow } from '@/components/app/recentActivityRow/recentActivityRow'
import { hasAllFormFieldsOnUserForUpdateUserProfileForm } from '@/components/app/updateUserProfileForm/hasAllFormFieldsOnUser'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormErrorMessage,
  FormField,
  FormGeneralErrorMessage,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { PlacesAutocomplete } from '@/components/ui/googlePlacesSelect'
import { Input } from '@/components/ui/input'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useLocale } from '@/hooks/useLocale'
import {
  GenericErrorFormValues,
  trackFormSubmissionSyncErrors,
  triggerServerActionForForm,
} from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'
import { zodUpdateUserProfileFormFields } from '@/validation/forms/zodUpdateUserProfile'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserActionOptInType, UserActionType } from '@prisma/client'
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
  user: SensitiveDataClientUser & { address: ClientAddress | null }
  onCancel: () => void
  onSuccess: () => void
}) {
  const locale = useLocale()
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(zodUpdateUserProfileFormFields),
    defaultValues: {
      fullName: user.fullName,
      email: user.primaryUserEmailAddress?.address || '',
      phoneNumber: user.phoneNumber,
      isPubliclyVisible: user.isPubliclyVisible,
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
      <PageTitle size="sm" className="mb-3">
        {hasAllFormFieldsOnUserForUpdateUserProfileForm(user) ? 'Edit' : 'Finish'} your profile
      </PageTitle>
      <PageSubTitle className="mb-7">
        Completing your profile makes it easier for you to take action, locate your representative
        and find local events. Stand With Crypto will never share your data with any third-parties.
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
                  'Address Administrative Area Level 1': address?.administrativeAreaLevel1,
                  'Address Country Code': address?.countryCode,
                  'Address Locality': address?.locality,
                  'Is Publicly Visible': values.isPubliclyVisible,
                },
              },
              () => actionUpdateUserProfile({ ...values, address }),
            )
            if (result.status === 'success') {
              router.refresh()
              toast.success('Profile updated', { duration: 5000 })
              onSuccess()
            }
          }, trackFormSubmissionSyncErrors(FORM_NAME))}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormErrorMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
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
              name="address"
              render={({ field: { ref, ...field } }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <PlacesAutocomplete
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
          <div>
            <FormField
              control={form.control}
              name="isPubliclyVisible"
              render={({ field: { value, ...field } }) => (
                <FormItem>
                  <FormLabel className="mb-3 flex items-center justify-between">
                    <div>How you appear:</div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-fontcolor-muted">Anonymous</p>
                      <FormControl>
                        <Checkbox
                          {...field}
                          checked={!value}
                          onCheckedChange={val => field.onChange(!val)}
                        />
                      </FormControl>
                    </div>
                  </FormLabel>
                  <FormErrorMessage />
                </FormItem>
              )}
            />

            <div className="rounded bg-blue-50 px-6 py-3">
              <RecentActivityRow
                disableHover
                action={{
                  __client: true,
                  optInType: UserActionOptInType.SWC_SIGN_UP,
                  actionType: UserActionType.OPT_IN,
                  datetimeCreated: new Date(),
                  nftMint: null,
                  id: 'mockId',
                  user: {
                    ...user,
                    isPubliclyVisible: form.getValues('isPubliclyVisible'),
                  },
                }}
                locale={locale}
              />
            </div>
          </div>
          <FormGeneralErrorMessage control={form.control} />
          <div className="flex justify-end gap-4">
            <Button
              onClick={onCancel}
              size="lg"
              variant="secondary"
              disabled={form.formState.isSubmitting}
            >
              Maybe later
            </Button>
            <Button size="lg" type="submit" disabled={form.formState.isSubmitting}>
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
