import { useMemo } from 'react'
import { UserActionLetterStatus, UserActionType } from '@prisma/client'
import { noop } from 'lodash-es'

import type { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { DTSICongresspersonAssociatedWithFormAddress } from '@/components/app/dtsiCongresspersonAssociatedWithFormAddress'
import { USER_ACTION_FORM_SUCCESS_SCREEN_INFO } from '@/components/app/userActionFormSuccessScreen/constants'
import {
  UserActionFormSuccessScreenDefaultImage,
  UserActionFormSuccessScreenFeedback,
} from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import {
  UserActionFormSuccessScreenNextAction,
  UserActionFormSuccessScreenNextActionSkeleton,
} from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenNextAction'
import { TimelinePlotPointStatus } from '@/components/ui/timeline/constants'
import { Timeline } from '@/components/ui/timeline/timeline'
import type { TimelinePlotPoint } from '@/components/ui/timeline/types'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useGetDTSIPeopleFromAddress } from '@/hooks/useGetDTSIPeopleFromAddress'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import type { UserActionCampaignNames } from '@/utils/shared/userActionCampaigns'
import { getYourPoliticianCategoryDisplayName } from '@/utils/shared/yourPoliticianCategory'
import type { YourPoliticianCategory } from '@/validation/fields/zodYourPoliticianCategory'

const orderedStatuses: Array<{
  status: UserActionLetterStatus
  title: string
  description: string
}> = [
  {
    status: UserActionLetterStatus.READY,
    title: 'Order created',
    description:
      'Your letter order has been created and queued. Printing will begin in the next business day.',
  },
  {
    status: UserActionLetterStatus.PRINTING,
    title: 'Printing ',
    description: 'Your letter is being printed.',
  },
  {
    status: UserActionLetterStatus.PROCESSED_FOR_DELIVERY,
    title: 'In transit',
    description: 'Your letter has been handed off for delivery.',
  },
  {
    status: UserActionLetterStatus.COMPLETED,
    title: 'Delivered',
    description: 'Your letter has been delivered.',
  },
]

function buildRecipientPlotPoints(
  recipient: LetterAction['userActionLetterRecipients'][number],
): TimelinePlotPoint[] {
  const updates = [...recipient.userActionLetterStatusUpdates]
    .map(update => ({
      ...update,
      timestamp: update.postgridUpdatedAt || update.datetimeCreated,
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const currentStatus = updates[updates.length - 1]?.status

  const timestamps: Record<UserActionLetterStatus, Date | null> = {} as any
  orderedStatuses.forEach(step => {
    const update = updates.find(u => u.status === step.status)
    timestamps[step.status] = update ? new Date(update.timestamp) : null
  })

  const plotPoints: TimelinePlotPoint[] = orderedStatuses.map((step, index) => ({
    id: index,
    title: step.title,
    description: step.description,
    isHighlighted: step.status === currentStatus,
    isMajorMilestone: true,
    status:
      step.status === currentStatus
        ? TimelinePlotPointStatus.INTRODUCED
        : TimelinePlotPointStatus.PENDING,
    date: timestamps[step.status],
  }))

  return plotPoints
}

type PerformedUserActions = NonNullable<
  GetUserFullProfileInfoResponse['user']
>['userActions'][number]
type LetterAction = Extract<PerformedUserActions, { actionType: typeof UserActionType.LETTER }>

export const UserActionFormLetterSuccess = ({
  countryCode,
  campaignName,
  politicianCategory,
}: {
  countryCode: SupportedCountryCodes
  campaignName: UserActionCampaignNames
  politicianCategory: YourPoliticianCategory
}) => {
  const userProfileResponse = useApiResponseForUserFullProfileInfo({
    revalidateOnMount: true,
  })
  const { user } = userProfileResponse.data || { user: null }
  const performedActionsResponse = useApiResponseForUserPerformedUserActionTypes({
    revalidateOnMount: true,
  })

  const userActionLetter = useMemo(
    () =>
      user?.userActions?.find(
        (action): action is LetterAction =>
          action.actionType === UserActionType.LETTER && action.campaignName === campaignName,
      ) ?? null,
    [user, campaignName],
  )

  const dtsiPeopleFromAddressResponse = useGetDTSIPeopleFromAddress({
    address: userActionLetter?.address?.formattedDescription,
    filterFn: () => true,
  })

  return (
    <div className="flex h-full flex-col gap-8 md:pb-12">
      <div className="flex flex-col items-center justify-center gap-8">
        <div className="mx-auto">
          <UserActionFormSuccessScreenDefaultImage />
        </div>
        <div className="space-y-2">
          <UserActionFormSuccessScreenFeedback.Title>
            {USER_ACTION_FORM_SUCCESS_SCREEN_INFO.LETTER.title}
          </UserActionFormSuccessScreenFeedback.Title>
          <UserActionFormSuccessScreenFeedback.Description>
            {USER_ACTION_FORM_SUCCESS_SCREEN_INFO.LETTER.description}
          </UserActionFormSuccessScreenFeedback.Description>
        </div>
      </div>

      <div>
        {userActionLetter?.userActionLetterRecipients.map(recipient => {
          return (
            <div className="flex flex-col gap-4 sm:gap-0" key={recipient.id}>
              <Timeline
                countryCode={countryCode}
                plotPoints={buildRecipientPlotPoints(recipient)}
              />
              <DTSICongresspersonAssociatedWithFormAddress
                address={
                  userActionLetter?.address
                    ? {
                        description: userActionLetter?.address?.formattedDescription,
                        place_id: userActionLetter?.address?.googlePlaceId,
                      }
                    : undefined
                }
                categoryDisplayName={getYourPoliticianCategoryDisplayName({
                  countryCode,
                  category: politicianCategory,
                })}
                countryCode={countryCode}
                dtsiPeopleFromAddressResponse={dtsiPeopleFromAddressResponse}
                onChangeAddress={noop}
              />
            </div>
          )
        })}
      </div>

      {performedActionsResponse.isLoading || userProfileResponse.isLoading ? (
        <UserActionFormSuccessScreenNextActionSkeleton />
      ) : (
        <UserActionFormSuccessScreenNextAction
          data={{
            countryCode,
            userHasEmbeddedWallet: user?.hasEmbeddedWallet || false,
            performedUserActionTypes: performedActionsResponse.data?.performedUserActionTypes || [],
          }}
        />
      )}
    </div>
  )
}
