'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/navigation'

import { actionCreateUserActionEmailCongressperson } from '@/actions/actionCreateUserActionEmailCongressperson'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON,
  SectionNames,
} from '@/components/app/userActionFormEmailCongressperson/common/constants'
import { EmailCongressperson } from '@/components/app/userActionFormEmailCongressperson/common/sections/email'
import { UserActionFormEmailCongresspersonSuccess } from '@/components/app/userActionFormEmailCongressperson/common/sections/success'
import {
  EmailActionFormValues,
  UserActionFormEmailCongresspersonPropsBase,
} from '@/components/app/userActionFormEmailCongressperson/common/types'
import { useEmailActionCampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/common/useEmailActionCampaignMetadata'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { useGetDTSIPeopleFromAddress } from '@/hooks/useGetDTSIPeopleFromAddress'
import { useSections } from '@/hooks/useSections'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import {
  filterDTSIPeopleByUSPoliticalCategory,
  getUSPoliticianCategoryDisplayName,
} from '@/utils/shared/yourPoliticianCategory/us'
import { cn } from '@/utils/web/cn'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import {
  catchUnexpectedServerErrorAndTriggerToast,
  toastGenericError,
} from '@/utils/web/toastUtils'
import { zodUserActionFormEmailCongresspersonFields } from '@/validation/forms/zodUserActionFormEmailCongressperson'

const countryCode = SupportedCountryCodes.US

interface USUserActionFormEmailCongresspersonProps
  extends UserActionFormEmailCongresspersonPropsBase {
  campaignName: USUserActionEmailCampaignName
}

export function USUserActionFormEmailCongressperson({
  user,
  initialValues,
  onCancel,
  campaignName,
}: USUserActionFormEmailCongresspersonProps) {
  const router = useRouter()
  const campaignMetadata = useEmailActionCampaignMetadata({
    campaignName,
    countryCode,
  })

  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.EMAIL,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON,
  })

  const userAddress = user?.address?.route
    ? {
        description: user.address.formattedDescription,
        place_id: user.address.googlePlaceId,
      }
    : undefined

  const form = useForm<EmailActionFormValues>({
    resolver: zodResolver(zodUserActionFormEmailCongresspersonFields),
    defaultValues: {
      campaignName: campaignMetadata.campaignName,
      contactMessage: campaignMetadata.getEmailBodyText({
        firstName: user?.firstName,
        lastName: user?.lastName,
        address: user?.address?.formattedDescription,
      }),
      subject: campaignMetadata.subject,
      politicianCategory: campaignMetadata.politicianCategory,
      firstName: initialValues?.firstName || user?.firstName || '',
      lastName: initialValues?.lastName || user?.lastName || '',
      emailAddress: initialValues?.email || user?.primaryUserEmailAddress?.emailAddress || '',
      address: initialValues?.address || userAddress,
      dtsiSlugs: [],
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
  const dtsiPeopleFromAddressResponse = useGetDTSIPeopleFromAddress({
    address: addressField?.description,
    filterFn: filterDTSIPeopleByUSPoliticalCategory(campaignMetadata.politicianCategory),
  })

  switch (sectionProps.currentSection) {
    case SectionNames.EMAIL:
      return (
        <EmailCongressperson>
          <EmailCongressperson.Form form={form} onSubmit={onSubmit}>
            <EmailCongressperson.Heading
              subtitle={campaignMetadata.dialogSubtitle}
              title={campaignMetadata.dialogTitle}
            />
            <EmailCongressperson.PersonalInformationFields />
            <EmailCongressperson.Representatives
              categoryDisplayName={getUSPoliticianCategoryDisplayName(
                campaignMetadata.politicianCategory,
              )}
              countryCode={countryCode}
              dtsiPeopleFromAddressResponse={dtsiPeopleFromAddressResponse}
            />
            <EmailCongressperson.Message getEmailBodyText={campaignMetadata.getEmailBodyText} />
            <EmailCongressperson.Disclaimer countryCode={countryCode} />
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
