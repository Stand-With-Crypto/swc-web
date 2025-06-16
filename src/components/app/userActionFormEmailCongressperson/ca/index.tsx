'use client'

import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

import { actionCreateUserActionEmailCongresspersonIntl } from '@/actions/actionCreateUserActionEmailCongresspersonIntl'
import { getCAEmailActionCampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/ca/campaigns'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON,
  SectionNames,
} from '@/components/app/userActionFormEmailCongressperson/common/constants'
import { GetTextProps } from '@/components/app/userActionFormEmailCongressperson/common/emailBodyUtils'
import { EmailCongressperson } from '@/components/app/userActionFormEmailCongressperson/common/sections/email'
import { UserActionFormEmailCongresspersonSuccess } from '@/components/app/userActionFormEmailCongressperson/common/sections/success'
import {
  EmailActionFormValues,
  UserActionFormEmailCongresspersonPropsBase,
} from '@/components/app/userActionFormEmailCongressperson/common/types'
import { useEmailActionCampaignMetadata } from '@/components/app/userActionFormEmailCongressperson/common/useEmailActionCampaignMetadata'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { useGetDTSIPeopleFromAddress } from '@/hooks/useGetDTSIPeopleFromAddress'
import { useGoogleMapsScript } from '@/hooks/useGoogleMapsScript'
import { useSections } from '@/hooks/useSections'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { CAUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import {
  filterDTSIPeopleByCAPoliticalCategory,
  getCAPoliticianCategoryDisplayName,
  YourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory/ca'
import { cn } from '@/utils/web/cn'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import {
  convertGooglePlaceAutoPredictionToAddressSchema,
  GooglePlaceAutocompletePrediction,
} from '@/utils/web/googlePlaceUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import {
  catchUnexpectedServerErrorAndTriggerToast,
  toastGenericError,
} from '@/utils/web/toastUtils'
import { zodAddress } from '@/validation/fields/zodAddress'
import { zodUserActionFormEmailCongresspersonFields } from '@/validation/forms/zodUserActionFormEmailCongressperson'

const countryCode = SupportedCountryCodes.CA

const DEFAULT_POLITICIAN_CATEGORY = getCAEmailActionCampaignMetadata(
  CAUserActionEmailCampaignName.DEFAULT,
).politicianCategory

interface CAUserActionFormEmailCongresspersonProps
  extends UserActionFormEmailCongresspersonPropsBase {
  campaignName: CAUserActionEmailCampaignName
  politicianCategory?: YourPoliticianCategory
}
export function CAUserActionFormEmailCongressperson({
  user,
  initialValues,
  politicianCategory = DEFAULT_POLITICIAN_CATEGORY,
  onCancel,
  campaignName,
}: CAUserActionFormEmailCongresspersonProps) {
  const router = useRouter()
  const urls = getIntlUrls(countryCode)
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
        actionCreateUserActionEmailCongresspersonIntl(payload).then(async actionResultPromise => {
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
    filterFn: filterDTSIPeopleByCAPoliticalCategory(politicianCategory),
  })

  const scriptStatus = useGoogleMapsScript()
  const [locality, setLocality] = useState<z.infer<typeof zodAddress> | null>(null)
  const onChangeAddress = useCallback(
    async (prediction: GooglePlaceAutocompletePrediction | null) => {
      if (!scriptStatus.isLoaded) return
      if (!prediction) {
        setLocality(null)
        return
      }
      const addressSchema = await convertGooglePlaceAutoPredictionToAddressSchema(prediction)
      setLocality(addressSchema)
    },
    [scriptStatus.isLoaded],
  )
  useEffect(() => {
    void onChangeAddress(addressField)
  }, [addressField, onChangeAddress])

  const getEmailBodyTextWithDTSI = useCallback(
    (props: GetTextProps) => {
      return campaignMetadata.getEmailBodyText({
        ...props,
        addressSchema: locality,
        dtsiPeopleFromAddressResponse,
      })
    },
    [campaignMetadata, dtsiPeopleFromAddressResponse, locality],
  )

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
              categoryDisplayName={getCAPoliticianCategoryDisplayName(politicianCategory)}
              countryCode={countryCode}
              dtsiPeopleFromAddressResponse={dtsiPeopleFromAddressResponse}
            />
            <EmailCongressperson.Message getEmailBodyText={getEmailBodyTextWithDTSI} />
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
