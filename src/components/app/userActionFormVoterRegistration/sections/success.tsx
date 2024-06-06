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
          className="h-[180px] overflow-hidden rounded-xl object-cover "
          height={180}
          sizes="345px"
          src="/actionTypeIcons/registerToVote.png"
          width={345}
        />
      }
      {...USER_ACTION_FORM_SUCCESS_SCREEN_INFO.VOTER_REGISTRATION}
    />
  )
}
