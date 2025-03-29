import { USER_ACTION_FORM_SUCCESS_SCREEN_INFO } from '@/components/app/userActionFormSuccessScreen/constants'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'

export const UserActionFormVotingInformationResearchedSuccess = () => {
  return (
    <UserActionFormSuccessScreenFeedback
      {...USER_ACTION_FORM_SUCCESS_SCREEN_INFO.VOTING_INFORMATION_RESEARCHED}
    />
  )
}
