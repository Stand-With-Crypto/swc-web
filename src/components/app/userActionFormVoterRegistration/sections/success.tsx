import { USER_ACTION_FORM_SUCCESS_SCREEN_INFO } from '@/components/app/userActionFormSuccessScreen/constants'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { NextImage } from '@/components/ui/image'
import { NFTSlug } from '@/utils/shared/nft'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'

const I_AM_A_VOTER_NFT_IMAGE = NFT_CLIENT_METADATA[NFTSlug.I_AM_A_VOTER].image

export const UserActionFormVoterRegistrationSuccess = () => {
  return (
    <UserActionFormSuccessScreenFeedback
      image={
        <NextImage
          alt={I_AM_A_VOTER_NFT_IMAGE.alt}
          height={120}
          src="/actionTypeIcons/registerToVote.png"
          width={120}
        />
      }
      {...USER_ACTION_FORM_SUCCESS_SCREEN_INFO.VOTER_REGISTRATION}
    />
  )
}
