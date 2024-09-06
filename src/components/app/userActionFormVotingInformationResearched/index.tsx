'use client'

import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'

import { actionCreateUserActionVotingInformationResearched } from '@/actions/actionCreateUserActionVotingInformationResearched'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_VOTING_INFORMATION_RESEARCHED,
  SECTIONS_NAMES,
} from '@/components/app/userActionFormVotingInformationResearched/constants'
import { UserActionFormVotingInformationResearchedSuccess } from '@/components/app/userActionFormVotingInformationResearched/sections/success'
import { buildElectoralUrl } from '@/components/app/userActionFormVotingInformationResearched/utils'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useEffectOnce } from '@/hooks/useEffectOnce'
import { useSections } from '@/hooks/useSections'
import { openWindow } from '@/utils/shared/openWindow'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import {
  catchUnexpectedServerErrorAndTriggerToast,
  toastGenericError,
} from '@/utils/web/toastUtils'
import { zodAddress } from '@/validation/fields/zodAddress'

import { Address } from './sections/address'
import { FORM_NAME, VotingInformationResearchedFormValues } from './formConfig'

export interface UserActionFormVotingInformationResearchedProps {
  onSuccess: () => void
  initialValues: Omit<VotingInformationResearchedFormValues, 'address'> & {
    address?: VotingInformationResearchedFormValues['address']
  }
}

export const UserActionFormVotingInformationResearched = (
  props: UserActionFormVotingInformationResearchedProps,
) => {
  const { onSuccess, initialValues } = props

  const sectionProps = useSections({
    sections: Object.values(SECTIONS_NAMES),
    initialSectionId: initialValues?.address?.place_id
      ? SECTIONS_NAMES.LOADING
      : SECTIONS_NAMES.ADDRESS,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_VOTING_INFORMATION_RESEARCHED,
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const { mutate } = useApiResponseForUserFullProfileInfo()

  const handleTurboVoteRedirect = (address: z.infer<typeof zodAddress>) => {
    void mutate()
    const target = searchParams?.get('target') ?? '_blank'
    const url = buildElectoralUrl(address)
    openWindow(url.toString(), target, `noopener`)
  }

  const createActionAndRedirect = async () => {
    if (!initialValues?.address) return

    const address = await convertGooglePlaceAutoPredictionToAddressSchema(
      initialValues.address,
    ).catch(e => {
      Sentry.captureException(e)
      catchUnexpectedServerErrorAndTriggerToast(e)
      return null
    })
    if (!address) {
      sectionProps.goToSection(SECTIONS_NAMES.ADDRESS)
      return
    }
    const result = await triggerServerActionForForm(
      {
        formName: FORM_NAME,
        analyticsProps: {
          ...(address ? convertAddressToAnalyticsProperties(address) : {}),
          'Campaign Name': initialValues?.campaignName,
          'User Action Type': UserActionType.VOTING_INFORMATION_RESEARCHED,
          'Subscribed to notifications': initialValues.shouldReceiveNotifications,
        },
        payload: { ...initialValues, address },
        onError: () => {
          sectionProps.goToSection(SECTIONS_NAMES.ADDRESS)
          toastGenericError()
        },
      },
      payload =>
        actionCreateUserActionVotingInformationResearched(payload).then(actionResult => {
          if (actionResult && 'user' in actionResult && actionResult.user) {
            identifyUserOnClient(actionResult.user)
          }
          return actionResult
        }),
    )
    if (result.status === 'success') {
      router.refresh()
      handleTurboVoteRedirect(address)
      sectionProps.goToSection(SECTIONS_NAMES.SUCCESS)
    }
  }

  useEffectOnce(() => {
    if (initialValues?.address?.place_id) {
      sectionProps.goToSection(SECTIONS_NAMES.LOADING)
      void createActionAndRedirect().then(() => sectionProps.goToSection(SECTIONS_NAMES.SUCCESS))
    }
  })

  switch (sectionProps.currentSection) {
    case SECTIONS_NAMES.LOADING:
      return (
        <div className="min-h-[400px]">
          <LoadingOverlay />
        </div>
      )
    case SECTIONS_NAMES.ADDRESS:
      return (
        <Address
          initialValues={initialValues}
          onSuccess={() => sectionProps.goToSection(SECTIONS_NAMES.SUCCESS)}
        />
      )
    case SECTIONS_NAMES.SUCCESS:
      return (
        <UserActionFormSuccessScreen onClose={onSuccess}>
          <UserActionFormVotingInformationResearchedSuccess />
        </UserActionFormSuccessScreen>
      )
    default:
      sectionProps.onSectionNotFound()
      return null
  }
}
