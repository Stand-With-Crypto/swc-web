import { USER_ACTION_FORM_SUCCESS_SCREEN_INFO } from '@/components/app/userActionFormSuccessScreen/constants'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'

export const UserActionFormShareOnTwitterSuccess = () => {
  return <UserActionFormSuccessScreenFeedback {...USER_ACTION_FORM_SUCCESS_SCREEN_INFO.TWEET} />
}
