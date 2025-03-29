'use client'

import { Suspense } from 'react'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { UserActionFormVoterAttestation } from '@/components/app/userActionFormVoterAttestation'
import { ANALYTICS_NAME_USER_ACTION_FORM_VOTER_ATTESTATION } from '@/components/app/userActionFormVoterAttestation/constants'
import { LazyUserActionFormVoterAttestation } from '@/components/app/userActionFormVoterAttestation/lazyLoad'
import { UserActionFormVoterAttestationSkeleton } from '@/components/app/userActionFormVoterAttestation/skeleton'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'

export function UserActionFormVoterAttestationDialog({
  children,
  defaultOpen = false,
  ...formProps
}: Omit<React.ComponentProps<typeof UserActionFormVoterAttestation>, 'user' | 'onClose'> & {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_VOTER_ATTESTATION,
  })
  const { data, isLoading } = useApiResponseForUserFullProfileInfo()
  const { user } = data ?? { user: null }

  return (
    <UserActionFormDialog {...dialogProps} padding={false} trigger={children}>
      {isLoading ? (
        <UserActionFormVoterAttestationSkeleton />
      ) : (
        <Suspense fallback={<UserActionFormVoterAttestationSkeleton />}>
          <LazyUserActionFormVoterAttestation
            {...formProps}
            onClose={() => dialogProps.onOpenChange(false)}
            user={user}
          />
        </Suspense>
      )}
    </UserActionFormDialog>
  )
}
