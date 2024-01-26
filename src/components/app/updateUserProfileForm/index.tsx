'use client'
import { actionUpdateUserProfile } from '@/actions/actionUpdateUserProfile'
import { ClientAddress } from '@/clientModels/clientAddress'
import { SensitiveDataClientUserWithENSData } from '@/clientModels/clientUser/sensitiveDataClientUser'
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
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { Input } from '@/components/ui/input'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLocale } from '@/hooks/useLocale'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import {
  GenericErrorFormValues,
  trackFormSubmissionSyncErrors,
  triggerServerActionForForm,
} from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'
import {
  USER_INFORMATION_VISIBILITY_DISPLAY_NAME_MAP,
  USER_INFORMATION_VISIBILITY_ORDERED_LIST,
} from '@/utils/web/userUtils'
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
  user: SensitiveDataClientUserWithENSData & { address: ClientAddress | null }
  onCancel: () => void
  onSuccess: () => void
}) {
  const locale = useLocale()
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(zodUpdateUserProfileFormFields),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.primaryUserEmailAddress?.emailAddress || '',
      phoneNumber: user.phoneNumber,
      informationVisibility: user.informationVisibility,
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
                  ...(address ? convertAddressToAnalyticsProperties(address) : {}),
                  'Information Visibility': values.informationVisibility,
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
          <div className="grid grid-cols-1 gap-4">
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
              render={({ field: { ref: _ref, ...field } }) => (
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
          <div>
            <FormField
              control={form.control}
              name="informationVisibility"
              render={({ field: { ref, ...field } }) => (
                <FormItem>
                  <FormLabel className="mb-3 flex items-center justify-between">
                    <div>How you appear:</div>
                    <Select
                      value={field.value}
                      onOpenChange={open => {
                        if (!open) {
                          field.onBlur()
                        }
                      }}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger ref={ref}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_INFORMATION_VISIBILITY_ORDERED_LIST.map(option => (
                          <SelectItem key={option} value={option}>
                            {USER_INFORMATION_VISIBILITY_DISPLAY_NAME_MAP[option]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  optInType: UserActionOptInType.SWC_SIGN_UP_AS_SUBSCRIBER,
                  actionType: UserActionType.OPT_IN,
                  datetimeCreated: new Date(),
                  nftMint: null,
                  id: 'mockId',
                  user: {
                    ...user,
                    firstName: form.getValues('firstName'),
                    lastName: form.getValues('lastName'),
                    informationVisibility: form.getValues('informationVisibility'),
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
