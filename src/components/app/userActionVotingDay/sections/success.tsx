import { USER_ACTION_FORM_SUCCESS_SCREEN_INFO } from '@/components/app/userActionFormSuccessScreen/constants'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { DidYouVoteVideo } from '@/components/app/userActionVotingDay/didYouVoteVideo'
import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/ui/link'
import { createTweetLink } from '@/utils/web/createTweetLink'

export const UserActionIVotedSuccess = () => {
  return (
    <div className="flex h-full flex-col items-center justify-between gap-8">
      <UserActionFormSuccessScreenFeedback
        image={<DidYouVoteVideo />}
        isVotingDay
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
