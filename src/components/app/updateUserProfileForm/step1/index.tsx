'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { actionUpdateUserProfile } from '@/actions/actionUpdateUserProfile'
import { ClientAddress } from '@/clientModels/clientAddress'
import { SensitiveDataClientUser } from '@/clientModels/clientUser/sensitiveDataClientUser'
import {
  DEFAULT_DISCLAIMER,
  DISCLAIMERS_BY_COUNTRY_CODE,
} from '@/components/app/updateUserProfileForm/step1/constants'
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
import { validatePhoneNumber } from '@/utils/shared/phoneNumber'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { trackFormSubmissionSyncErrors, triggerServerActionForForm } from '@/utils/web/formUtils'
import {
  convertGooglePlaceAutoPredictionToAddressSchema,
  GooglePlaceAutocompletePrediction,
} from '@/utils/web/googlePlaceUtils'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'
import {
  zodUpdateUserProfileFormFields,
  zodUpdateUserProfileWithRequiredFormFields,
} from '@/validation/forms/zodUpdateUserProfile/zodUpdateUserProfileFormFields'

const FORM_NAME = 'User Profile'

export function UpdateUserProfileForm({
  user,
  shouldFieldsBeRequired = false,
  onSuccess,
}: {
  user: SensitiveDataClientUser & { address: ClientAddress | null }
  shouldFieldsBeRequired?: boolean
  onSuccess: (updatedUserFields: {
    firstName: string
    lastName: string
    address: GooglePlaceAutocompletePrediction | null
  }) => void
}) {
  const router = useRouter()
  const defaultValues = useRef({
    isEmbeddedWalletUser: user.hasEmbeddedWallet,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    emailAddress: user.primaryUserEmailAddress?.emailAddress || '',
    phoneNumber: user.phoneNumber || '',
    hasOptedInToMembership: user.hasOptedInToMembership,
    optedInToSms: user.smsStatus !== 'NOT_OPTED_IN' && user.smsStatus !== 'OPTED_OUT',
    address: user.address
      ? { description: user.address.formattedDescription, place_id: user.address.googlePlaceId }
      : null,
  })

  const form = useForm({
    resolver: zodResolver(
      shouldFieldsBeRequired
        ? zodUpdateUserProfileWithRequiredFormFields
        : zodUpdateUserProfileFormFields,
    ),
    defaultValues: defaultValues.current,
  })

  const phoneNumberValue = useWatch({ control: form.control, name: 'phoneNumber' })
  const addressValue = useWatch({ control: form.control, name: 'address' })

  const [resolvedAddress, setResolvedAddress] = useState<Awaited<
    ReturnType<typeof convertGooglePlaceAutoPredictionToAddressSchema>
  > | null>(null)
  const [shouldShowCountryCodeDisclaimer, setShouldShowCountryCodeDisclaimer] = useState(false)

  useEffect(() => {
    async function resolveAddress() {
      if (addressValue) {
        const newAddress = await convertGooglePlaceAutoPredictionToAddressSchema(
          addressValue,
        ).catch(e => {
          Sentry.captureException(e)
          catchUnexpectedServerErrorAndTriggerToast(e)
          return null
        })

        setResolvedAddress(newAddress)
        setShouldShowCountryCodeDisclaimer(false)
      }
    }

    void resolveAddress()
  }, [addressValue])

  useEffect(() => {
    if (resolvedAddress) {
      const addressCountryCode = resolvedAddress.countryCode.toLowerCase()
      const userCountryCode = user.countryCode.toLowerCase()

      const { success, data: validatedAddressCountryCode } =
        zodSupportedCountryCode.safeParse(addressCountryCode)

      const TEMPORARY_ALLOWED_COUNTRY_CODE = 'gb' // TODO(@olavoparno): Remove this once we start supporting UK inside zodSupportedCountryCode

      const isCountryCodeSupported =
        success || addressCountryCode === TEMPORARY_ALLOWED_COUNTRY_CODE

      if (isCountryCodeSupported && validatedAddressCountryCode !== userCountryCode) {
        setShouldShowCountryCodeDisclaimer(true)
      }
    }
  }, [resolvedAddress, user.countryCode])

  const onSubmit = async (values: typeof defaultValues.current) => {
    const result = await triggerServerActionForForm(
      {
        form,
        formName: FORM_NAME,
        analyticsProps: {
          ...(resolvedAddress ? convertAddressToAnalyticsProperties(resolvedAddress) : {}),
        },
        payload: { ...values, address: resolvedAddress, optedInToSms: !!values.phoneNumber },
      },
      payload => actionUpdateUserProfile(payload),
    )
    if (result.status === 'success') {
      router.refresh()
      toast.success('Profile updated', { duration: 5000 })
      const { firstName, lastName } = values
      onSuccess({ firstName, lastName, address: values.address })
    }
  }

  return (
    <Form {...form}>
      <form
        className="flex min-h-full flex-col gap-6"
        onSubmit={form.handleSubmit(onSubmit, trackFormSubmissionSyncErrors(FORM_NAME))}
      >
        <div>
          <PageTitle className="mb-1" size="md">
            {hasCompleteUserProfile(user) ? 'Edit' : 'Finish'} your profile
          </PageTitle>
          <PageSubTitle className="mb-7" size="md">
            Completing your profile makes it easier for you to take action, locate your
            representative and find local events.
          </PageSubTitle>
        </div>

        <div className="flex h-full flex-col space-y-4">
          {user.hasEmbeddedWallet || (
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

          <div className="flex flex-col justify-center gap-4 max-md:!mt-auto md:mt-4">
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
            <Collapsible open={shouldShowCountryCodeDisclaimer}>
              <CollapsibleContent className="AnimateCollapsibleContent">
                <FormDescription className="text-center lg:text-left">
                  {getCountryCodeDisclaimer(resolvedAddress?.countryCode)}
                </FormDescription>
              </CollapsibleContent>
            </Collapsible>
          </div>
          {user.smsStatus !== 'OPTED_IN_HAS_REPLIED' &&
            !validatePhoneNumber(user?.phoneNumber || '') && (
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="phone-number-input"
                        placeholder="Phone number"
                        {...field}
                        onChange={e => {
                          field.onChange(e)
                          if (!e.target.value && form.getValues('optedInToSms')) {
                            form.setValue('optedInToSms', false)
                          }
                        }}
                      />
                    </FormControl>
                    <FormErrorMessage />
                  </FormItem>
                )}
              />
            )}
          {!defaultValues.current.hasOptedInToMembership && (
            <FormField
              control={form.control}
              name="hasOptedInToMembership"
              render={({ field }) => (
                <label className="block">
                  <FormItem>
                    <div className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          data-testid="opt-in-checkbox"
                          onCheckedChange={field.onChange}
                        />
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
        <div className="flex flex-col justify-center gap-4 max-md:!mt-auto md:mt-4">
          <Collapsible
            open={
              !!phoneNumberValue &&
              user.smsStatus === 'NOT_OPTED_IN' &&
              !validatePhoneNumber(user?.phoneNumber || '')
            }
          >
            <CollapsibleContent className="AnimateCollapsibleContent">
              <FormDescription className="text-center lg:text-left">
                By clicking Next, you consent to receive recurring texts from Stand With Crypto. You
                can reply STOP to stop receiving texts. Message and data rates may apply.
              </FormDescription>
            </CollapsibleContent>
          </Collapsible>
          <Button
            className="w-full self-center md:w-1/2"
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

function getCountryCodeDisclaimer(countryCode?: string) {
  const parsedCountryCode = zodSupportedCountryCode.safeParse(countryCode)

  return parsedCountryCode.data
    ? DISCLAIMERS_BY_COUNTRY_CODE[parsedCountryCode.data as SupportedCountryCodes]
    : DEFAULT_DISCLAIMER
}
