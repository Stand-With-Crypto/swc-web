import { DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO } from '@/components/app/userActionFormSuccessScreen/constants'
import {
  UserActionFormSuccessScreenFeedback,
  UserActionFormSuccessScreenFeedbackProps,
} from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'

const ABC_EMAIL_FORM_SUCCESS_SCREEN_INFO: UserActionFormSuccessScreenFeedbackProps = {
  title: 'You emailed ABC!',
  description: DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO['WITHOUT_NFT'],
}

export const UserActionFormEmailABCSuccess = () => {
  return <UserActionFormSuccessScreenFeedback {...ABC_EMAIL_FORM_SUCCESS_SCREEN_INFO} />
}