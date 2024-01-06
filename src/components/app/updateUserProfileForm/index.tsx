'use client'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormErrorMessage,
  FormGeneralErrorMessage,
  FormSuccessMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { zodUpdateUserProfileFormFields } from '@/validation/zodUpdateUserProfile'
import { actionEmailYourCongressPerson } from '@/actions/sampleArchitecture/actionEmailYourCongressPerson'
import { GenericErrorFormValues, triggerServerActionForForm } from '@/utils/web/formUtils'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PlacesAutocomplete } from '@/components/ui/googlePlacesSelect'
import { getDetails } from 'use-places-autocomplete'
import { formatGooglePlacesResultToAddress } from '@/utils/web/formatGooglePlacesResultToAddress'
import { UserAvatar } from '@/components/app/userAvatar'
import { RecentActivityRow } from '@/components/app/recentActivityRow/recentActivityRow'
import { ClientUser } from '@/clientModels/clientUser/clientUser'
import { SupportedLocale } from '@/intl/locales'
import { UserActionOptInType, UserActionType } from '@prisma/client'
import { SensitiveDataClientUser } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { ClientAddress } from '@/clientModels/clientAddress'
import { Checkbox } from '@/components/ui/checkbox'
import { hasAllFormFieldsOnUserForUpdateUserProfileForm } from '@/components/app/updateUserProfileForm/hasAllFormFieldsOnUser'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'
import { actionUpdateUserProfile } from '@/actions/actionUpdateUserProfile'

const FORM_NAME = 'User Profile'
type FormValues = z.infer<typeof zodUpdateUserProfileFormFields> & GenericErrorFormValues

export function UpdateUserProfileForm({
  user,
  locale,
  onCancel,
  onSuccess,
}: {
  user: SensitiveDataClientUser & { address: ClientAddress | null }
  locale: SupportedLocale
  onCancel: () => void
  onSuccess: () => void
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(zodUpdateUserProfileFormFields),
    defaultValues: {
      fullName: user.fullName,
      email: user.primaryEmailAddress?.address || '',
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
              ? await getDetails({
                  placeId: values.address.place_id,
                  fields: ['address_components'],
                })
                  .then(_details => {
                    const address = values.address!
                    const details = _details as Required<
                      Pick<google.maps.places.PlaceResult, 'address_components'>
                    >
                    return formatGooglePlacesResultToAddress({
                      ...details,
                      formattedDescription: address.description,
                      placeId: address.place_id,
                    })
                  })
                  .catch(e => {
                    Sentry.captureException(e)
                    catchUnexpectedServerErrorAndTriggerToast(e)
                    return null
                  })
              : null

            return triggerServerActionForForm({ form, formName: FORM_NAME }, () =>
              actionUpdateUserProfile({ ...values, address }),
            )
          })}
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
          {form.formState.isSubmitSuccessful && (
            <FormSuccessMessage>Great work!</FormSuccessMessage>
          )}
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
