import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { USER_ACTION_FORM_SUCCESS_SCREEN_INFO } from '@/components/app/userActionFormSuccessScreen/constants'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'

export const UserActionFormEmailCongresspersonSuccess = ({ onClose }: { onClose: () => void }) => {
  return (
    <UserActionFormSuccessScreen onClose={onClose}>
      <UserActionFormSuccessScreenFeedback {...USER_ACTION_FORM_SUCCESS_SCREEN_INFO.EMAIL} />
    </UserActionFormSuccessScreen>
  )
}
