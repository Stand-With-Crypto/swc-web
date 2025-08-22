'use client'

import { Suspense, useEffect, useState } from 'react'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { UserActionFormPetitionSignature } from '@/components/app/userActionFormPetitionSignature'
import { getPetitionData } from '@/components/app/userActionFormPetitionSignature/getPetitionData'
import { UserActionFormPetitionSignatureSkeleton } from '@/components/app/userActionFormPetitionSignature/skeleton'
import { useDialog } from '@/hooks/useDialog'
import { PetitionData } from '@/types/petition'
import { cn } from '@/utils/web/cn'

function UserActionFormPetitionSignatureDialogContent({
  petitionSlug,
  onClose,
}: {
  petitionSlug?: string
  onClose: () => void
}) {
  const [petitionData, setPetitionData] = useState<PetitionData | null>(null)

  useEffect(() => {
    void getPetitionData(petitionSlug).then(setPetitionData)
  }, [petitionSlug])

  if (!petitionData) {
    return <UserActionFormPetitionSignatureSkeleton />
  }

  return <UserActionFormPetitionSignature onSuccess={onClose} petitionData={petitionData} />
}

export function UserActionFormPetitionSignatureDialog({
  children,
  defaultOpen = false,
  className,
  petitionSlug,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  petitionSlug?: string
}) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: 'User Action Form Petition Signature',
  })

  return (
    <UserActionFormDialog {...dialogProps} className={cn('!p-0', className)} trigger={children}>
      <Suspense fallback={<UserActionFormPetitionSignatureSkeleton />}>
        <UserActionFormPetitionSignatureDialogContent
          onClose={() => dialogProps.onOpenChange(false)}
          petitionSlug={petitionSlug}
        />
      </Suspense>
    </UserActionFormDialog>
  )
}
