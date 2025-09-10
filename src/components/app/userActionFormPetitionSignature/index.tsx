'use client'

import React, { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'

import { actionCreateUserActionPetitionSignature } from '@/actions/actionCreateUserActionPetitionSignature'
import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { PrivacyNotice } from '@/components/app/userActionFormPetitionSignature/privacyNotice'
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
import { COUNTRY_CODE_TO_DISPLAY_NAME } from '@/utils/shared/intl/displayNames'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'
import {
  GENERIC_FORM_ERROR_KEY,
  trackFormSubmissionSyncErrors,
  triggerServerActionForForm,
} from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import {
  catchUnexpectedServerErrorAndTriggerToast,
  toastGenericError,
} from '@/utils/web/toastUtils'
import {
  type UserActionPetitionSignatureValues,
  zodUserActionFormPetitionSignature,
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

export function UserActionFormPetitionSignature({
  onSuccess,
  petitionData,
  user,
}: UserActionFormPetitionSignatureProps) {
  const hasAlreadySigned = useMemo(() => {
    return user?.userActions?.some(
      userAction =>
        userAction.actionType === UserActionType.SIGN_PETITION &&
        userAction.campaignName === petitionData.slug,
    )
  }, [user, petitionData.slug])

  const form = useForm<UserActionPetitionSignatureValues>({
    resolver: zodResolver(zodUserActionFormPetitionSignature),
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
          message: 'Invalid address',
        })
        return
      }

      const addressCountryCode = address.countryCode?.toLowerCase()
      const petitionCountryCode = petitionData.countryCode?.toLowerCase()

      if (addressCountryCode !== petitionCountryCode) {
        const expectedCountryName =
          COUNTRY_CODE_TO_DISPLAY_NAME[petitionCountryCode as SupportedCountryCodes] ||
          petitionCountryCode?.toUpperCase()

        form.setError('address', {
          message: `This petition is only available to residents of ${expectedCountryName}. Please enter an address in ${expectedCountryName}.`,
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
    [form, onSuccess, petitionData.slug, petitionData.countryCode, hasAlreadySigned],
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
                  <FormLabel>First Name</FormLabel>
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
          </div>

          <FormField
            control={form.control}
            name="emailAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Your email address" {...field} />
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
                  <GooglePlacesSelect {...field} placeholder="Your full address" />
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
                <span>
                  Sign<span className="hidden lg:inline"> petition</span>
                </span>
              )}
            </Button>
          </Footer>
        </div>
      </form>
    </Form>
  )
}
