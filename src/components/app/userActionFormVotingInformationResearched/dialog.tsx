'use client'

import { Suspense } from 'react'
import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import dynamic from 'next/dynamic'

import { actionCreateUserActionVotingInformationResearched } from '@/actions/actionCreateUserActionVotingInformationResearched'
import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { UserActionFormVotingInformationResearchedProps } from '@/components/app/userActionFormVotingInformationResearched'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_VOTING_INFORMATION_RESEARCHED,
  SectionsNames,
} from '@/components/app/userActionFormVotingInformationResearched/constants'
import { buildElectoralUrl } from '@/components/app/userActionFormVotingInformationResearched/utils'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { useGoogleMapsScript } from '@/hooks/useGoogleMapsScript'
import { useSections } from '@/hooks/useSections'
import { useSession } from '@/hooks/useSession'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { UserActionVotingInformationResearchedCampaignName } from '@/utils/shared/userActionCampaigns'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { convertGooglePlaceAutoPredictionToAddressSchema } from '@/utils/web/googlePlaceUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import {
  catchUnexpectedServerErrorAndTriggerToast,
  toastGenericError,
} from '@/utils/web/toastUtils'

import { FORM_NAME } from './formConfig'

const UserActionFormVotingInformationResearched = dynamic(
  () =>
    import('@/components/app/userActionFormVotingInformationResearched').then(
      mod => mod.UserActionFormVotingInformationResearched,
    ),
  {
    loading: () => (
      <div className="min-h-[400px]">
        <LoadingOverlay />
      </div>
    ),
  },
)

interface UserActionFormVotingInformationResearchedDialog
  extends Partial<UserActionFormVotingInformationResearchedProps> {
  children: React.ReactNode
  defaultOpen?: boolean
}

export function UserActionFormVotingInformationResearchedDialog({
  children,
  defaultOpen = false,
  ...formProps
}: UserActionFormVotingInformationResearchedDialog) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: FORM_NAME,
  })

  const { user, isLoading: isLoadingSession } = useSession()
  const scriptStatus = useGoogleMapsScript()
  const isLoading = isLoadingSession || !scriptStatus.isLoaded

  const sectionProps = useSections({
    sections: Object.values(SectionsNames),
    initialSectionId: isLoading ? SectionsNames.LOADING : SectionsNames.ADDRESS,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_VOTING_INFORMATION_RESEARCHED,
  })

  const initialValues = {
    address: user?.address
      ? {
          description: user?.address?.formattedDescription,
          place_id: user?.address?.googlePlaceId,
        }
      : formProps.initialValues?.address,
    shouldReceiveNotifications: formProps.initialValues?.shouldReceiveNotifications || false,
    campaignName:
      formProps.initialValues?.campaignName ||
      UserActionVotingInformationResearchedCampaignName['2025_US_ELECTIONS'],
  }

  const { mutate } = useApiResponseForUserFullProfileInfo()

  const createActionAndRedirect = async () => {
    if (isLoading) {
      sectionProps.goToSection(SectionsNames.LOADING)
      return
    }

    if (!initialValues?.address?.place_id) {
      sectionProps.goToSection(SectionsNames.ADDRESS)
      return
    }

    const address = await convertGooglePlaceAutoPredictionToAddressSchema(
      initialValues.address,
    ).catch(e => {
      Sentry.captureException(e)
      catchUnexpectedServerErrorAndTriggerToast(e)
      return null
    })
    if (!address) {
      sectionProps.goToSection(SectionsNames.ADDRESS)
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
          sectionProps.goToSection(SectionsNames.ADDRESS)
          toastGenericError()
        },
      },
      payload =>
        actionCreateUserActionVotingInformationResearched(payload).then(async actionPromise => {
          const actionResult = await actionPromise
          if (actionResult && 'user' in actionResult && actionResult.user) {
            identifyUserOnClient(actionResult.user)
          }
          return actionResult
        }),
    )

    if (result.status === 'success') {
      void mutate()
      sectionProps.goToSection(SectionsNames.SUCCESS)
      const url = buildElectoralUrl(address)
      return url.toString()
    } else {
      sectionProps.goToSection(SectionsNames.ADDRESS)
    }
  }

  return (
    <Suspense fallback={children}>
      <UserActionFormDialog
        {...dialogProps}
        onOpenChange={open => {
          if (isLoading) return
          dialogProps.onOpenChange(open)
        }}
        trigger={
          <div
            onClick={() => {
              if (isLoading) return
              if (!initialValues?.address?.place_id) {
                sectionProps.goToSection(SectionsNames.ADDRESS)
                return
              }

              const windowRef = window.open()
              void createActionAndRedirect().then(url => {
                if (url && windowRef) {
                  windowRef.location = url
                }
              })
            }}
          >
            {children}
          </div>
        }
      >
        {isLoading ? (
          <div className="min-h-[400px]">
            <LoadingOverlay />
          </div>
        ) : (
          <UserActionFormVotingInformationResearched
            {...sectionProps}
            initialValues={initialValues}
            onClose={() => {
              dialogProps.onOpenChange(false)
            }}
          />
        )}
      </UserActionFormDialog>
    </Suspense>
  )
}
