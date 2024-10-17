import { UserActionType } from '@prisma/client'
import { useRouter } from 'next/navigation'

import { actionCreateUserActionVotingDay } from '@/actions/actionCreateUserActionVotingDay'
import { useLoadingCallback } from '@/hooks/useLoadingCallback'
import { UserActionVotingDayCampaignName } from '@/utils/shared/userActionCampaigns'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { toastGenericError } from '@/utils/web/toastUtils'

export function useVotingDayAction() {
  const router = useRouter()

  const [createAction, isCreatingAction] = useLoadingCallback(
    async (onSuccess: () => void) => {
      const result = await triggerServerActionForForm(
        {
          formName: 'User Action Form Voting Day',
          onError: toastGenericError,
          analyticsProps: {
            'Campaign Name': UserActionVotingDayCampaignName['2024_ELECTION'],
            'User Action Type': UserActionType.VOTING_DAY,
            votingYear: new Date().getFullYear().toString(),
          },
          payload: null,
        },
        () =>
          actionCreateUserActionVotingDay().then(actionResult => {
            if (actionResult && 'user' in actionResult && actionResult.user) {
              identifyUserOnClient(actionResult.user)
            }
            return actionResult
          }),
      )

      if (result.status === 'success') {
        router.refresh()
        onSuccess()
      }
    },
    [router],
  )

  return { createAction, isCreatingAction }
}
