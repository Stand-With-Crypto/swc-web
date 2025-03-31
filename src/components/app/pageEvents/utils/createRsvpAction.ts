import { UserActionType } from '@prisma/client'

import {
  actionCreateUserActionRsvpEvent,
  CreateActionRsvpEventInput,
} from '@/actions/actionCreateUserActionRsvpEvent'
import { USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { SWCEvent } from '@/utils/shared/zod/getSWCEvents'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { toastGenericError } from '@/utils/web/toastUtils'

export async function handleCreateRsvpAction({
  event,
  shouldReceiveNotifications,
}: {
  event: SWCEvent
  shouldReceiveNotifications: boolean
}) {
  const data: CreateActionRsvpEventInput = {
    eventSlug: event.slug,
    eventState: event.state,
    shouldReceiveNotifications,
  }

  const result = await triggerServerActionForForm(
    {
      formName: 'RSVP Event',
      onError: () => toastGenericError(),
      analyticsProps: {
        'Campaign Name': USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP.RSVP_EVENT,
        'User Action Type': UserActionType.RSVP_EVENT,
        eventSlug: event.slug,
        eventState: event.state,
        shouldReceiveNotifications,
      },
      payload: data,
    },
    payload =>
      actionCreateUserActionRsvpEvent(payload).then(async actionResultPromise => {
        const actionResult = await actionResultPromise

        if (actionResult?.user) {
          identifyUserOnClient(actionResult.user)
        }
        return actionResult
      }),
  )

  if (result.status !== 'success') {
    toastGenericError()
  }
}
