import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { Button } from '@/components/ui/button'

interface JoinSWCProps {
  onClose: () => void
  title?: string
  description?: string
}

export function JoinSWC(props: JoinSWCProps) {
  const { onClose, title, description } = props

  return (
    <div className="flex h-full min-h-[400px] flex-col gap-4">
      <UserActionFormSuccessScreenFeedback
        description={
          description ??
          'You did your part to save crypto. Join Stand With Crypto to become a member or sign in to have this action count towards your advocacy progress.'
        }
        title={title ?? 'Nice work!'}
      />

      <div className="mt-auto flex flex-col items-center gap-4">
        <LoginDialogWrapper>
          <Button className="w-full md:w-1/2">Join Stand With Crypto</Button>
        </LoginDialogWrapper>

        <LoginDialogWrapper
          authenticatedContent={
            <Button className="w-full md:w-1/2" onClick={onClose} variant="secondary">
              Done
            </Button>
          }
        >
          <Button className="w-full md:w-1/2" variant="secondary">
            Sign in
          </Button>
        </LoginDialogWrapper>
      </div>
    </div>
  )
}
