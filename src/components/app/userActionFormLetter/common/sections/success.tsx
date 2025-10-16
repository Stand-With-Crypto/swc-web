import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { USER_ACTION_FORM_SUCCESS_SCREEN_INFO } from '@/components/app/userActionFormSuccessScreen/constants'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'

export const UserActionFormLetterSuccess = ({ onClose }: { onClose: () => void }) => {
  return (
    <UserActionFormSuccessScreen onClose={onClose}>
      <UserActionFormSuccessScreenFeedback
        {...USER_ACTION_FORM_SUCCESS_SCREEN_INFO.EMAIL}
        title="Letter sent!"
        description="Your physical letter will be sent to your representative."
      />
    </UserActionFormSuccessScreen>
  )
}

