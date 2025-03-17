'use client'

import { Suspense, useEffect, useMemo, useRef } from 'react'
import { UserActionType } from '@prisma/client'
import { debounce } from 'lodash-es'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { UserActionFormVoterAttestation } from '@/components/app/userActionFormVoterAttestation'
import { LazyUserActionFormVoterAttestation } from '@/components/app/userActionFormVoterAttestation/lazyLoad'
import { UserActionFormVoterAttestationSkeleton } from '@/components/app/userActionFormVoterAttestation/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useCookieState } from '@/hooks/useCookieState'
import { useDialog } from '@/hooks/useDialog'

const OPEN_DIALOG_DELAY_IN_SECONDS = 15
const OPEN_DIALOG_SEEN_FLAG = 'SWC_HAS_OPENED_VOTER_ATTESTATION_INSIDE_KEY_RACES'

export function CallForVoterAttestationDialog({
  defaultOpen = false,
  ...formProps
}: Omit<React.ComponentProps<typeof UserActionFormVoterAttestation>, 'user' | 'onClose'> & {
  defaultOpen?: boolean
}) {
  const [hasOpenedDialog, setHasOpenedDialog] = useCookieState(OPEN_DIALOG_SEEN_FLAG)
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: 'Voter Attestation Dialog Inside Key Races',
  })
  const { data, isLoading } = useApiResponseForUserFullProfileInfo()
  const { user } = data ?? { user: null }

  const hasAlreadyPledgedToVote = useMemo(
    () =>
      !!user?.userActions?.some(currentAction => {
        return currentAction.actionType === UserActionType.VOTER_ATTESTATION
      }),
    [user],
  )

  const debouncedOpenDialog = useRef(
    debounce(() => {
      setHasOpenedDialog('true')

      return dialogProps.onOpenChange(true)
    }, OPEN_DIALOG_DELAY_IN_SECONDS * 1000),
  )

  useEffect(() => {
    const openDialog = debouncedOpenDialog.current

    if (!hasAlreadyPledgedToVote && hasOpenedDialog !== 'true') {
      openDialog()
    }

    return () => {
      openDialog.cancel()
    }
  }, [dialogProps, hasAlreadyPledgedToVote, hasOpenedDialog])

  const handleDialogClose = () => {
    return dialogProps.onOpenChange(false)
  }

  return (
    <UserActionFormDialog {...dialogProps} padding={false} trigger={null}>
      {isLoading ? (
        <UserActionFormVoterAttestationSkeleton />
      ) : (
        <Suspense fallback={<UserActionFormVoterAttestationSkeleton />}>
          <LazyUserActionFormVoterAttestation
            {...formProps}
            onClose={handleDialogClose}
            user={user}
          />
        </Suspense>
      )}
    </UserActionFormDialog>
  )
}
