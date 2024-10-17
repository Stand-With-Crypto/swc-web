import { USER_ACTION_FORM_SUCCESS_SCREEN_INFO } from '@/components/app/userActionFormSuccessScreen/constants'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { NFTSlug } from '@/utils/shared/nft'
import { createTweetLink } from '@/utils/web/createTweetLink'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'

const I_VOTED_NFT_IMAGE = NFT_CLIENT_METADATA[NFTSlug.I_VOTED].image

export const UserActionIVotedSuccess = () => {
  return (
    <div className="flex h-full flex-col items-center justify-between gap-8">
      <UserActionFormSuccessScreenFeedback
        image={
          <NextImage
            alt={I_VOTED_NFT_IMAGE.alt}
            height={120}
            src="/actionTypeIcons/iVoted.png"
            width={120}
          />
        }
        {...USER_ACTION_FORM_SUCCESS_SCREEN_INFO.VOTING_DAY}
      />
      <Button asChild className="w-full md:w-[250px]" size="lg" variant="default">
        <ExternalLink
          href={createTweetLink({
            message: `Thanks to @StandWithCrypto for helping me cast an informed vote in this year's election!`,
            url: 'www.standwithcrypto.org/i-voted',
          })}
        >
          Share on X
        </ExternalLink>
      </Button>
    </div>
  )
}
