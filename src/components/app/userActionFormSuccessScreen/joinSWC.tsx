'use client'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'

interface JoinSWCProps {
  onClose: () => void
}

export function JoinSWC(props: JoinSWCProps) {
  const { onClose } = props

  return (
    <div className="flex h-full min-h-[400px] flex-col gap-4">
      <UserActionFormSuccessScreenFeedback
        Image={
          <NextImage alt="Shield with checkmark" height={120} src="/logo/shield.svg" width={120} />
        }
        description="You did your part to save crypto. Join Stand With Crypto to become a member or sign in to have this action count towards your advocacy progress."
        title="Nice work!"
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
