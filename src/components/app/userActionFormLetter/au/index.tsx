'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/navigation'

import { actionCreateUserActionLetter } from '@/actions/actionCreateUserActionLetter'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_LETTER,
  SectionNames,
} from '@/components/app/userActionFormLetter/common/constants'
import { Letter } from '@/components/app/userActionFormLetter/common/sections/letter'
import { UserActionFormLetterSuccess } from '@/components/app/userActionFormLetter/common/sections/success'
import {
  LetterActionFormValues,
  UserActionFormLetterPropsBase,
} from '@/components/app/userActionFormLetter/common/types'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { useGetDTSIPeopleFromAddress } from '@/hooks/useGetDTSIPeopleFromAddress'
import { useSections } from '@/hooks/useSections'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { AUUserActionLetterCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import {
  filterDTSIPeopleByAUPoliticalCategory,
  getAUPoliticianCategoryDisplayName,
} from '@/utils/shared/yourPoliticianCategory/au'
import { cn } from '@/utils/web/cn'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import {
  catchUnexpectedServerErrorAndTriggerToast,
  toastGenericError,
} from '@/utils/web/toastUtils'
import { zodUserActionFormLetterFields } from '@/validation/forms/zodUserActionFormLetter'

import { getAULetterActionCampaignMetadata } from './campaigns'

const countryCode = SupportedCountryCodes.AU

interface AUUserActionFormLetterProps extends UserActionFormLetterPropsBase {
  campaignName: AUUserActionLetterCampaignName
}

export function AUUserActionFormLetter({
  user,
  initialValues,
  onCancel,
  campaignName,
}: AUUserActionFormLetterProps) {
  const router = useRouter()
  const campaignMetadata = getAULetterActionCampaignMetadata(campaignName)

  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.LETTER,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_LETTER,
  })

  const userAddress = user?.address?.route
    ? {
        description: user.address.formattedDescription,
        place_id: user.address.googlePlaceId,
        latitude: user.address.latitude,
        longitude: user.address.longitude,
      }
    : undefined

  const form = useForm<LetterActionFormValues>({
    resolver: zodResolver(zodUserActionFormLetterFields),
    defaultValues: {
      campaignName: campaignMetadata.campaignName,
      letterPreview: campaignMetadata.getLetterBodyText({
        firstName: user?.firstName,
        lastName: user?.lastName,
        address: user?.address?.formattedDescription,
      }),
      politicianCategory: campaignMetadata.politicianCategory,
      firstName: initialValues?.firstName || user?.firstName || '',
      lastName: initialValues?.lastName || user?.lastName || '',
      emailAddress: initialValues?.email || user?.primaryUserEmailAddress?.emailAddress || '',
      address: initialValues?.address || userAddress,
      dtsiSlugs: [],
    },
  })

  const onSubmit = async (values: LetterActionFormValues) => {
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
        formName: ANALYTICS_NAME_USER_ACTION_FORM_LETTER,
        analyticsProps: {
          ...(address ? convertAddressToAnalyticsProperties(address) : {}),
          'Campaign Name': values.campaignName,
          'User Action Type': UserActionType.LETTER,
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
        actionCreateUserActionLetter(payload).then(async actionResultPromise => {
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
    filterFn: filterDTSIPeopleByAUPoliticalCategory(campaignMetadata.politicianCategory),
  })

  switch (sectionProps.currentSection) {
    case SectionNames.LETTER:
      return (
        <Letter>
          <Letter.Form form={form} onSubmit={onSubmit}>
            <Letter.Heading
              subtitle={campaignMetadata.dialogSubtitle}
              title={campaignMetadata.dialogTitle}
            />
            <Letter.PersonalInformationFields />
            <Letter.Representatives
              categoryDisplayName={getAUPoliticianCategoryDisplayName(
                campaignMetadata.politicianCategory,
              )}
              countryCode={countryCode}
              dtsiPeopleFromAddressResponse={dtsiPeopleFromAddressResponse}
            />
            <Letter.Preview getLetterBodyText={campaignMetadata.getLetterBodyText} />
            <Letter.Disclaimer countryCode={countryCode} />
          </Letter.Form>
        </Letter>
      )
    case SectionNames.SUCCESS:
      return (
        <div className={cn(dialogContentPaddingStyles, 'h-full')}>
          <UserActionFormLetterSuccess onClose={onCancel} />
        </div>
      )
    default:
      sectionProps.onSectionNotFound()
      return null
  }
}

