import { USER_ACTION_FORM_SUCCESS_SCREEN_INFO } from '@/components/app/userActionFormSuccessScreen/constants'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { NFTDisplay } from '@/components/app/userActionFormVoterAttestation/sections/nftDisplay'

export const UserActionFormCallCongresspersonSuccess = () => {
  return (
    <UserActionFormSuccessScreenFeedback
      image={<NFTDisplay />}
      {...USER_ACTION_FORM_SUCCESS_SCREEN_INFO.VOTER_ATTESTATION}
    />
  )
}
