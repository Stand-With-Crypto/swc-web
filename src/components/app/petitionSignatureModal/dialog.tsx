'use client'

import { Suspense } from 'react'

import { UserActionFormPetitionSignature } from '@/components/app/petitionSignatureModal'
import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useDialog } from '@/hooks/useDialog'

export function UserActionFormPetitionSignatureDialog({
  children,
  defaultOpen = false,
  title,
  description,
  goal,
  signatures,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
  title: string
  description: string
  goal: number
  signatures: number
}) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: 'User Action Form Petition Signature',
  })

  return (
    <UserActionFormDialog {...dialogProps} trigger={children}>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <UserActionFormPetitionSignature
          description={description}
          goal={goal}
          onClose={() => dialogProps.onOpenChange(false)}
          signatures={signatures}
          title={title}
        />
      </Suspense>
    </UserActionFormDialog>
  )
}
