import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { NextImage } from '@/components/ui/image'
import { NFTSlug } from '@/utils/shared/nft'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'

const I_AM_A_VOTER_NFT_IMAGE = NFT_CLIENT_METADATA[NFTSlug.I_AM_A_VOTER].image

export const UserActionFormVoterRegistrationSuccess = () => {
  return (
    <UserActionFormSuccessScreenFeedback
      Image={
        <div className="relative h-[180px] w-[345px] overflow-hidden rounded-xl">
          <NextImage
            alt={I_AM_A_VOTER_NFT_IMAGE.alt}
            fill
            objectFit="cover"
            src="/actionTypeIcons/registerToVote.png"
          />
        </div>
      }
      subtitle="... and got a free NFT for doing so!"
      title="You registered to vote!"
    />
  )
}
