'use client'

import React, { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

import { actionCreateUserActionPetitionSignature } from '@/actions/actionCreateUserActionPetitionSignature'
import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { PrivacyNotice } from '@/components/app/userActionFormPetitionSignature/privacyNotice'
import { getPetitionCountryCodeValidator } from '@/components/app/userActionFormPetitionSignature/utils/getPetitionCountryCodeValidator'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormErrorMessage,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loadingSpinner'
import { useLoadingCallback } from '@/hooks/useLoadingCallback'
import { withI18nCommons } from '@/utils/shared/i18n/commons'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { mergeI18nMessages } from '@/utils/shared/i18n/mergeI18nMessages'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'
import {
  GENERIC_FORM_ERROR_KEY,
  trackFormSubmissionSyncErrors,
  triggerServerActionForForm,
} from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { useTranslation } from '@/utils/web/i18n/useTranslation'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import {
  catchUnexpectedServerErrorAndTriggerToast,
  toastGenericError,
} from '@/utils/web/toastUtils'
import {
  createUserActionFormPetitionSignature,
  userActionFormPetitionSignatureI18nMessages,
  type UserActionPetitionSignatureValues,
} from '@/validation/forms/zodUserActionFormPetitionSignature'

import { FormContainer } from './container'
import { Footer } from './footer'
import { PetitionHeader } from './header'

const ANALYTICS_NAME_USER_ACTION_FORM_PETITION_SIGNATURE = 'User Action Form Petition Signature'

interface UserActionFormPetitionSignatureProps {
  onSuccess?: () => void
  petitionData: SWCPetition
  user: GetUserFullProfileInfoResponse['user']
}

const i18nMessages = withI18nCommons(
  createI18nMessages({
    defaultMessages: {
      en: {
        signPetition: 'Sign petition',
        sign: 'Sign',
        firstName: 'First Name',
        firstNamePlaceholder: 'Your first name',
        lastName: 'Last name',
        lastNamePlaceholder: 'Your last name',
        email: 'Email',
        emailPlaceholder: 'Your email address',
        address: 'Address',
        addressPlaceholder: 'Your full address',
        petitionUnavailableForCountry:
          'This petition is only available to residents of {countryName}.',
        invalidAddress: 'Invalid address',
      },
      de: {
        signPetition: 'Petition unterschreiben',
        sign: 'Unterschreiben',
        firstName: 'Vorname',
        firstNamePlaceholder: 'Ihr Vorname',
        lastName: 'Nachname',
        lastNamePlaceholder: 'Ihr Nachname',
        email: 'E-Mail',
        emailPlaceholder: 'Ihre E-Mail-Adresse',
        address: 'Adresse',
        addressPlaceholder: 'Ihre vollständige Adresse',
        petitionUnavailableForCountry:
          'Diese Petition steht nur Einwohnern von {countryName} zur Verfügung.',
        invalidAddress: 'Ungültige Adresse',
      },
      fr: {
        signPetition: 'Signer la pétition',
        sign: 'Signer',
        firstName: 'Prénom',
        firstNamePlaceholder: 'Votre prénom',
        lastName: 'Nom',
        lastNamePlaceholder: 'Votre nom',
        email: 'E-mail',
        emailPlaceholder: 'Votre adresse e-mail',
        address: 'Adresse',
        addressPlaceholder: 'Votre adresse complète',
        petitionUnavailableForCountry:
          "Cette pétition n'est disponible que pour les résidents de {countryName}.",
        invalidAddress: 'Adresse invalide',
      },
    },
  }),
)

export const formPetitionSignatureI18nMessages = i18nMessages

export function UserActionFormPetitionSignature({
  onSuccess,
  petitionData,
  user,
}: UserActionFormPetitionSignatureProps) {
  const { t } = useTranslation(
    mergeI18nMessages(i18nMessages, userActionFormPetitionSignatureI18nMessages),
    'UserActionFormPetitionSignature',
  )

  const hasAlreadySigned = useMemo(() => {
    return user?.userActions?.some(
      userAction =>
        userAction.actionType === UserActionType.SIGN_PETITION &&
        userAction.campaignName === petitionData.slug,
    )
  }, [user, petitionData.slug])

  const form = useForm<UserActionPetitionSignatureValues>({
    resolver: zodResolver(createUserActionFormPetitionSignature(t)),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      emailAddress: user?.primaryUserEmailAddress?.emailAddress || '',
      address: user?.address?.route
        ? {
            description: user.address.formattedDescription,
            place_id: user.address.googlePlaceId,
          }
        : undefined,
      campaignName: petitionData.slug,
    },
  })

  const { title, countSignaturesGoal, signaturesCount } = petitionData

  const [onSubmit, isSubmitting] = useLoadingCallback(
    async (values: UserActionPetitionSignatureValues) => {
      if (!values.address || hasAlreadySigned) return

      const address = await convertGooglePlaceAutoPredictionToAddressSchema(values.address).catch(
        e => {
          Sentry.captureException(e)
          catchUnexpectedServerErrorAndTriggerToast(e)
          return null
        },
      )

      if (!address) {
        form.setError('address', {
          message: t('invalidAddress'),
        })
        return
      }

      const validateCountryCode = getPetitionCountryCodeValidator(
        petitionData.countryCode.toLowerCase() as SupportedCountryCodes,
      )

      if (!validateCountryCode(address.countryCode)) {
        const countryName = t(petitionData.countryCode.toUpperCase())

        form.setError('address', {
          message: t('petitionUnavailableForCountry', { countryName }),
        })
        return
      }

      const result = await triggerServerActionForForm(
        {
          form,
          formName: ANALYTICS_NAME_USER_ACTION_FORM_PETITION_SIGNATURE,
          analyticsProps: {
            ...(address ? convertAddressToAnalyticsProperties(address) : {}),
            'Campaign Name': values.campaignName,
            'User Action Type': 'SIGN_PETITION',
            'Petition Slug': petitionData.slug,
          },
          payload: { ...values, address },
          onError: (_, error) => {
            form.setError(GENERIC_FORM_ERROR_KEY, {
              message: error.message,
            })
            toastGenericError()
          },
        },
        payload =>
          actionCreateUserActionPetitionSignature(payload).then(async actionResultPromise => {
            const actionResult = await actionResultPromise
            if (actionResult && 'user' in actionResult && actionResult.user) {
              identifyUserOnClient(actionResult.user)
            }
            return actionResult
          }),
      )

      if (result.status === 'success') {
        onSuccess?.()
      }
    },
    [form, onSuccess, petitionData.slug, petitionData.countryCode, hasAlreadySigned, t],
  )

  const addressField = useWatch({ control: form.control, name: 'address' })

  return (
    <Form {...form}>
      <form
        className="flex h-full flex-col space-y-0 pb-40"
        onSubmit={form.handleSubmit(
          onSubmit,
          trackFormSubmissionSyncErrors(ANALYTICS_NAME_USER_ACTION_FORM_PETITION_SIGNATURE),
        )}
      >
        <PetitionHeader
          goal={countSignaturesGoal}
          petitionSlug={petitionData.slug}
          signaturesCount={signaturesCount}
          title={title}
        />

        <FormContainer>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('firstName')}</FormLabel>
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
                  <FormLabel>{t('lastName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('lastNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormErrorMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="emailAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('emailPlaceholder')} {...field} />
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
                <FormLabel>{t('address')}</FormLabel>
                <FormControl>
                  <GooglePlacesSelect {...field} placeholder={t('addressPlaceholder')} />
                </FormControl>
                <FormErrorMessage />
              </FormItem>
            )}
          />
        </FormContainer>

        <div>
          <Footer>
            <PrivacyNotice />
            <Button
              className="h-12 w-full"
              disabled={
                isSubmitting || !form.formState.isValid || !addressField || hasAlreadySigned
              }
              size="default"
              type="submit"
            >
              {isSubmitting ? (
                <LoadingSpinner />
              ) : (
                <>
                  <span className="hidden lg:inline">{t('signPetition')}</span>
                  <span className="block lg:hidden">{t('sign')}</span>
                </>
              )}
            </Button>
          </Footer>
        </div>
      </form>
    </Form>
  )
}
