'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

import { actionCreateUserActionEmailCongressperson } from '@/actions/actionCreateUserActionEmailCongressperson'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON,
  SectionNames,
} from '@/components/app/userActionFormEmailCongressperson/common/constants'
import { EmailCongressperson } from '@/components/app/userActionFormEmailCongressperson/common/sections/email'
import { UserActionFormEmailCongresspersonSuccess } from '@/components/app/userActionFormEmailCongressperson/common/sections/success'
import { UserActionFormEmailCongresspersonProps } from '@/components/app/userActionFormEmailCongressperson/common/types'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { useGetDTSIPeopleFromAddress } from '@/hooks/useGetDTSIPeopleFromAddress'
import { useSections } from '@/hooks/useSections'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'
import { GenericErrorFormValues, triggerServerActionForForm } from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import {
  catchUnexpectedServerErrorAndTriggerToast,
  toastGenericError,
} from '@/utils/web/toastUtils'
import { zodUserActionFormEmailCongresspersonFields } from '@/validation/forms/zodUserActionFormEmailCongressperson'

import {
  DIALOG_SUBTITLE,
  DIALOG_TITLE,
  EMAIL_FLOW_POLITICIANS_CATEGORY,
  getDefaultFormValuesWithCampaignMetadata,
  getEmailBodyText,
} from './campaignMetadata'

const countryCode = SupportedCountryCodes.AU

export type EmailActionFormValues = z.infer<typeof zodUserActionFormEmailCongresspersonFields> &
  GenericErrorFormValues

export function AUUserActionFormEmailCongressperson({
  user,
  initialValues,
  politicianCategory = EMAIL_FLOW_POLITICIANS_CATEGORY,
  onCancel,
}: UserActionFormEmailCongresspersonProps) {
  const router = useRouter()
  const urls = getIntlUrls(countryCode)
  const userDefaultValues = getDefaultFormValuesWithCampaignMetadata({ user, dtsiSlugs: [] })

  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.EMAIL,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON,
  })

  const form = useForm<EmailActionFormValues>({
    resolver: zodResolver(zodUserActionFormEmailCongresspersonFields),
    defaultValues: {
      ...userDefaultValues,
      address: initialValues?.address || userDefaultValues.address,
      emailAddress: initialValues?.email || userDefaultValues.emailAddress,
      firstName: initialValues?.firstName || userDefaultValues.firstName,
      lastName: initialValues?.lastName || userDefaultValues.lastName,
      politicianCategory,
    },
  })

  const onSubmit = async (values: EmailActionFormValues) => {
    const address = await convertGooglePlaceAutoPredictionToAddressSchema(values.address).catch(
      e => {
        Sentry.captureException(e)
        catchUnexpectedServerErrorAndTriggerToast(e)
        return null
      },
    )
    if (!address) {
      return
    }
    const result = await triggerServerActionForForm(
      {
        form,
        formName: ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON,
        analyticsProps: {
          ...(address ? convertAddressToAnalyticsProperties(address) : {}),
          'Campaign Name': values.campaignName,
          'User Action Type': UserActionType.EMAIL,
          'DTSI Slug': values.dtsiSlugs[0],
          'DTSI Slugs': values.dtsiSlugs,
        },
        payload: { ...values, address },
        onError: (_, error) => {
          form.setError('FORM_ERROR', {
            message: error.message,
          })
          toastGenericError()
        },
      },
      payload =>
        actionCreateUserActionEmailCongressperson(payload).then(async actionResultPromise => {
          const actionResult = await actionResultPromise
          if (actionResult && 'user' in actionResult && actionResult.user) {
            identifyUserOnClient(actionResult.user)
          }
          return actionResult
        }),
    )
    if (result.status === 'success') {
      router.refresh()
      sectionProps.goToSection(SectionNames.SUCCESS)
    }
  }

  const addressField = form.watch('address')
  const dtsiPeopleFromAddressResponse = useGetDTSIPeopleFromAddress(
    politicianCategory,
    addressField?.description,
  )

  switch (sectionProps.currentSection) {
    case SectionNames.EMAIL:
      return (
        <EmailCongressperson>
          <EmailCongressperson.Form form={form} onSubmit={onSubmit}>
            <EmailCongressperson.Heading subtitle={DIALOG_SUBTITLE} title={DIALOG_TITLE} />
            <EmailCongressperson.PersonalInformationFields />
            <EmailCongressperson.Representatives
              countryCode={countryCode}
              dtsiPeopleFromAddressResponse={dtsiPeopleFromAddressResponse}
              politicianCategory={politicianCategory}
            />
            <EmailCongressperson.Message getEmailBodyText={getEmailBodyText} />
            <EmailCongressperson.Disclaimer
              countryCode={countryCode}
              quorumPrivacyPolicyUrl={urls.privacyPolicy()}
            />
          </EmailCongressperson.Form>
        </EmailCongressperson>
      )
    case SectionNames.SUCCESS:
      return (
        <div className={cn(dialogContentPaddingStyles, 'h-full')}>
          <UserActionFormEmailCongresspersonSuccess onClose={onCancel} />
        </div>
      )
    default:
      sectionProps.onSectionNotFound()
      return null
  }
}
