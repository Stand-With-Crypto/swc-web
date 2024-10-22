'use client'
import { useCallback } from 'react'

import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { DidYouVoteVideo } from '@/components/app/userActionVotingDay/didYouVoteVideo'
import { useVotingDayAction } from '@/components/app/userActionVotingDay/useVotingDayAction'
import { Button } from '@/components/ui/button'
import { DialogBody } from '@/components/ui/dialog'

interface DidYouVoteProps {
  onAnswer: () => void
}

export function DidYouVote({ onAnswer }: DidYouVoteProps) {
  const { createAction, isCreatingAction } = useVotingDayAction()

  const handleOnAnswer = useCallback(async () => {
    await createAction(onAnswer)
  }, [createAction, onAnswer])

  return (
    <>
      <UserActionFormLayout>
        <UserActionFormLayout.Container className="items-center">
          <div className="relative flex min-h-[250px] w-full justify-center">
            <DidYouVoteVideo />
          </div>
          <DialogBody className="flex flex-col gap-24 lg:pb-8">
            <UserActionFormLayout.Heading
              subtitle={`Whether you went to the polls or submitted a mail in ballot, claim your "I'm a Voter" NFT to show that you did your part in this year's election.`}
              title="Did you vote?"
            />
            <div className="flex flex-grow flex-col items-center justify-end gap-3 lg:flex-row lg:justify-center">
              <Button
                className="h-12 w-full md:w-[250px]"
                disabled={isCreatingAction}
                onClick={handleOnAnswer}
                size="lg"
                variant="default"
              >
                I voted
              </Button>
            </div>
          </DialogBody>
        </UserActionFormLayout.Container>
      </UserActionFormLayout>
    </>
  )
}
