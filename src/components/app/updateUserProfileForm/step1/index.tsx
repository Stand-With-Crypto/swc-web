'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { actionUpdateUserProfile } from '@/actions/actionUpdateUserProfile'
import { ClientAddress } from '@/clientModels/clientAddress'
import { ClientUserWithENSData } from '@/clientModels/clientUser/clientUser'
import { SensitiveDataClientUser } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { SMSOptInConsentText } from '@/components/app/sms/smsOptInConsentText'
import { AddressField } from '@/components/app/updateUserProfileForm/step1/addressField'
import { PrivacyConsentDisclaimer } from '@/components/app/updateUserProfileForm/step1/privacyConsentDisclaimer'
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
import { Input } from '@/components/ui/input'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useCountryCode } from '@/hooks/useCountryCode'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { validatePhoneNumber } from '@/utils/shared/phoneNumber'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import {
  isSmsSupportedInCountry,
  requiresOptInConfirmation,
} from '@/utils/shared/sms/smsSupportedCountries'
import { userHasOptedInToSMS } from '@/utils/shared/sms/userHasOptedInToSMS'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { ORDERED_SUPPORTED_EU_LANGUAGES, SupportedLanguages } from '@/utils/shared/supportedLocales'
import { getIntlUrls } from '@/utils/shared/urls'
import { trackFormSubmissionSyncErrors, triggerServerActionForForm } from '@/utils/web/formUtils'
import {
  convertGooglePlaceAutoPredictionToAddressSchema,
  GooglePlaceAutocompletePrediction,
} from '@/utils/web/googlePlaceUtils'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'
import { useTranslation } from '@/utils/web/i18n/useTranslation'
import {
  getZodUpdateUserProfileFormFields,
  getZodUpdateUserProfileWithRequiredFormFieldsSchema,
} from '@/validation/forms/zodUpdateUserProfile/zodUpdateUserProfileFormFields'

const FORM_NAME = 'User Profile'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      editProfile: 'Edit your profile',
      finishProfile: 'Finish your profile',
      subtitle:
        'Completing your profile makes it easier for you to take action, locate your representative and find local events.',
      emailLabel: 'Email',
      emailPlaceholder: 'Your email',
      firstNameLabel: 'First name',
      firstNamePlaceholder: 'First name',
      lastNameLabel: 'Last name',
      lastNamePlaceholder: 'Last name',
      phoneNumberLabel: 'Phone number',
      phoneNumberPlaceholder: 'Phone number',
      allianceCheckboxLabel:
        'By checking this box, I agree to become a Stand With Crypto Alliance member.',
      allianceCheckboxLearnMoreLabel: 'Learn More',
      next: 'Next',
      profileUpdated: 'Profile updated',
    },
    fr: {
      editProfile: 'Modifier votre profil',
      finishProfile: 'Terminer votre profil',
      subtitle:
        "Compléter votre profil facilite la prise d'action, la localisation de votre représentant et la recherche d'événements locaux.",
      emailLabel: 'E-mail',
      emailPlaceholder: 'Votre e-mail',
      firstNameLabel: 'Prénom',
      firstNamePlaceholder: 'Prénom',
      lastNameLabel: 'Nom',
      lastNamePlaceholder: 'Nom',
      phoneNumberLabel: 'Numéro de téléphone',
      phoneNumberPlaceholder: 'Numéro de téléphone',
      allianceCheckboxLabel:
        "En cochant cette case, j'accepte de devenir membre de Stand With Crypto Alliance.",
      allianceCheckboxLearnMoreLabel: 'En savoir plus',
      next: 'Suivant',
      profileUpdated: 'Profil mis à jour',
    },
    de: {
      editProfile: 'Bearbeiten ihr Profil',
      finishProfile: 'Fertig ihr Profil',
      subtitle:
        'Das Vervollständigen Ihres Profils erleichtert es Ihnen, Maßnahmen zu ergreifen, Ihren Vertreter zu finden und lokale Veranstaltungen zu entdecken.',
      emailLabel: 'E-Mail',
      emailPlaceholder: 'Ihre E-Mail',
      firstNameLabel: 'Vorname',
      firstNamePlaceholder: 'Vorname',
      lastNameLabel: 'Nachname',
      lastNamePlaceholder: 'Nachname',
      phoneNumberLabel: 'Telefonnummer',
      phoneNumberPlaceholder: 'Telefonnummer',
      allianceCheckboxLabel:
        'Indem ich dieses Kästchen ankreuze, erkläre ich mich damit einverstanden, Mitglied der Stand With Crypto Alliance zu werden.',
      allianceCheckboxLearnMoreLabel: 'Mehr erfahren',
      next: 'Weiter',
      profileUpdated: 'Profil aktualisiert',
    },
  },
})

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
  const { t, language } = useTranslation(i18nMessages)

  const countryCode = useCountryCode()
  const router = useRouter()
  const defaultValues = useRef({
    isEmbeddedWalletUser: user.hasEmbeddedWallet,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    emailAddress: user.primaryUserEmailAddress?.emailAddress || '',
    phoneNumber: user.phoneNumber || '',
    hasOptedInToMembership: user.hasOptedInToMembership,
    optedInToSms: userHasOptedInToSMS(user),
    address: user.address
      ? { description: user.address.formattedDescription, place_id: user.address.googlePlaceId }
      : null,
  })

  const form = useForm({
    resolver: zodResolver(
      shouldFieldsBeRequired
        ? getZodUpdateUserProfileWithRequiredFormFieldsSchema(countryCode, language)
        : getZodUpdateUserProfileFormFields(countryCode, language),
    ),
    defaultValues: defaultValues.current,
  })

  const phoneNumberValue = useWatch({ control: form.control, name: 'phoneNumber' })
  const [resolvedAddress, setResolvedAddress] = useState<Awaited<
    ReturnType<typeof convertGooglePlaceAutoPredictionToAddressSchema>
  > | null>(null)

  const onSubmit = async (values: typeof defaultValues.current) => {
    const result = await triggerServerActionForForm(
      {
        form,
        formName: FORM_NAME,
        analyticsProps: {
          ...(resolvedAddress ? convertAddressToAnalyticsProperties(resolvedAddress) : {}),
        },
        payload: { ...values, address: resolvedAddress },
      },
      actionUpdateUserProfile,
    )
    if (result.status === 'success') {
      const newCountryCode = (result.response as { user: ClientUserWithENSData })?.user?.countryCode
      const addressCountryCode = resolvedAddress?.countryCode.toLowerCase() as SupportedLanguages

      if (ORDERED_SUPPORTED_COUNTRIES.includes(newCountryCode) && newCountryCode !== countryCode) {
        router.push(
          getIntlUrls(newCountryCode as SupportedCountryCodes, {
            language: ORDERED_SUPPORTED_EU_LANGUAGES.includes(addressCountryCode)
              ? addressCountryCode
              : SupportedLanguages.EN,
          }).profile(),
        )
        return
      }

      router.refresh()
      toast.success(t('profileUpdated'), { duration: 5000 })
      const { firstName, lastName } = values
      onSuccess({ firstName, lastName, address: values.address })
    }
  }

  const shouldShowAllianceCheckbox =
    countryCode === DEFAULT_SUPPORTED_COUNTRY_CODE && !defaultValues.current.hasOptedInToMembership

  const shouldShowConsentDisclaimer = countryCode !== DEFAULT_SUPPORTED_COUNTRY_CODE

  const shouldShowSMSOptInCheckbox = useMemo(
    () => requiresOptInConfirmation(countryCode),
    [countryCode],
  )

  const phoneNumber = form.watch('phoneNumber')

  useEffect(() => {
    if (!shouldShowSMSOptInCheckbox) {
      form.setValue('optedInToSms', !!phoneNumber)
    }
  }, [form, phoneNumber, shouldShowSMSOptInCheckbox])

  return (
    <Form {...form}>
      <form
        className="flex min-h-full flex-col gap-6"
        data-testid="update-user-profile-form"
        onSubmit={form.handleSubmit(onSubmit, trackFormSubmissionSyncErrors(FORM_NAME))}
      >
        <div>
          <PageTitle className="mb-1" size="md">
            {hasCompleteUserProfile(user) ? t('editProfile') : t('finishProfile')}
          </PageTitle>
          <PageSubTitle className="mb-7" size="md">
            {t('subtitle')}
          </PageSubTitle>
        </div>

        <div className="flex h-full flex-col">
          {user.hasEmbeddedWallet || (
            <FormField
              control={form.control}
              name="emailAddress"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>{t('emailLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('emailPlaceholder')} {...field} />
                  </FormControl>
                  <FormErrorMessage />
                </FormItem>
              )}
            />
          )}
          <div className="mb-4 grid grid-cols-1 space-y-4 md:grid-cols-2 md:gap-8 md:space-y-0">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('firstNameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('firstNamePlaceholder')} {...field} />
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
                  <FormLabel>{t('lastNameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('lastNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormErrorMessage />
                </FormItem>
              )}
            />
          </div>

          <AddressField
            className="mb-4"
            resolvedAddress={resolvedAddress}
            setResolvedAddress={setResolvedAddress}
            user={user}
          />

          {user.smsStatus !== 'OPTED_IN_HAS_REPLIED' &&
            !validatePhoneNumber(user?.phoneNumber || '') && (
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>{t('phoneNumberLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="phone-number-input"
                        placeholder={t('phoneNumberPlaceholder')}
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
          <PrivacyConsentDisclaimer shouldShowConsentDisclaimer={shouldShowConsentDisclaimer} />
          {shouldShowAllianceCheckbox && (
            <FormField
              control={form.control}
              name="hasOptedInToMembership"
              render={({ field }) => (
                <label className="block">
                  <FormItem className="mb-4">
                    <div className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          data-testid="opt-in-checkbox"
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('allianceCheckboxLabel')}{' '}
                        <SWCMembershipDialog>
                          <button className="text-primary-cta">
                            {t('allianceCheckboxLearnMoreLabel')}
                          </button>
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
              !validatePhoneNumber(user?.phoneNumber || '') &&
              isSmsSupportedInCountry(countryCode)
            }
          >
            <CollapsibleContent className="AnimateCollapsibleContent">
              <FormField
                control={form.control}
                name="optedInToSms"
                render={({ field }) => (
                  <label className="block">
                    <FormItem className="mb-4">
                      <div className="flex flex-row items-start space-x-3 space-y-0">
                        {shouldShowSMSOptInCheckbox && (
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              className="mt-1"
                              data-testid="sms-opt-in-checkbox"
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        )}
                        <FormDescription className="text-left">
                          <SMSOptInConsentText
                            consentButtonText={t('next')}
                            countryCode={user.countryCode as SupportedCountryCodes}
                          />
                        </FormDescription>
                      </div>
                    </FormItem>
                  </label>
                )}
              />
            </CollapsibleContent>
          </Collapsible>
          <Button
            className="w-full self-center md:w-1/2"
            disabled={form.formState.isSubmitting}
            size="lg"
            type="submit"
          >
            {t('next')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
