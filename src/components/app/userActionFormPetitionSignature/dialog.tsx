'use client'

import { Suspense } from 'react'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { UserActionFormPetitionSignature } from '@/components/app/userActionFormPetitionSignature'
import { UserActionFormPetitionSignatureSkeleton } from '@/components/app/userActionFormPetitionSignature/skeleton'
import { useApiPetitionBySlug } from '@/hooks/useApiPetitionBySlug'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { cn } from '@/utils/web/cn'

function UserActionFormPetitionSignatureDialogContent({
  petitionSlug,
  countryCode,
  onClose,
}: {
  petitionSlug?: string
  countryCode: SupportedCountryCodes
  onClose: () => void
}) {
  const { data: petitionData, isLoading: isLoadingPetition } = useApiPetitionBySlug(
    countryCode,
    petitionSlug,
  )
  const { data: userData, isLoading: isLoadingUser } = useApiResponseForUserFullProfileInfo()

  const isLoading = isLoadingPetition || isLoadingUser

  if (isLoading || !petitionData) {
    return <UserActionFormPetitionSignatureSkeleton />
  }

  if (!userData?.user) {
    return null
  }

  return (
    <UserActionFormPetitionSignature
      onSuccess={onClose}
      petitionData={petitionData}
      user={userData.user}
    />
  )
}

export function UserActionFormPetitionSignatureDialog({
  children,
  defaultOpen = false,
  className,
  petitionSlug,
  countryCode,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  petitionSlug?: string
  countryCode: SupportedCountryCodes
}) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: 'User Action Form Petition Signature',
  })

  return (
    <UserActionFormDialog {...dialogProps} className={cn('!p-0', className)} trigger={children}>
      <Suspense fallback={<UserActionFormPetitionSignatureSkeleton />}>
        <UserActionFormPetitionSignatureDialogContent
          countryCode={countryCode}
          onClose={() => dialogProps.onOpenChange(false)}
          petitionSlug={petitionSlug}
        />
      </Suspense>
    </UserActionFormDialog>
  )
}
