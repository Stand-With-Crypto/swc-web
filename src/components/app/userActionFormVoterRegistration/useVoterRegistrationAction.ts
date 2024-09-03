import { UserActionType } from '@prisma/client'
import { useRouter } from 'next/navigation'

import {
  actionCreateUserActionVoterRegistration,
  CreateActionVoterRegistrationInput,
} from '@/actions/actionCreateUserActionVoterRegistration'
import { useLoadingCallback } from '@/hooks/useLoadingCallback'
import { UserActionVoterRegistrationCampaignName } from '@/utils/shared/userActionCampaigns'
import { USStateCode } from '@/utils/shared/usStateUtils'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { toastGenericError } from '@/utils/web/toastUtils'

export function useVoterRegistrationAction() {
  const router = useRouter()

  const [createAction, isCreatingAction] = useLoadingCallback(
    async ({ stateCode, onSuccess }: { stateCode: USStateCode; onSuccess: () => void }) => {
      const data: CreateActionVoterRegistrationInput = {
        campaignName: UserActionVoterRegistrationCampaignName.DEFAULT,
        usaState: stateCode,
      }

      const result = await triggerServerActionForForm(
        {
          formName: 'User Action Form Voter Registration',
          onError: toastGenericError,
          analyticsProps: {
            'Campaign Name': data.campaignName,
            'User Action Type': UserActionType.VOTER_REGISTRATION,
            State: data.usaState,
          },
          payload: data,
        },
        payload =>
          actionCreateUserActionVoterRegistration(payload).then(actionResult => {
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
