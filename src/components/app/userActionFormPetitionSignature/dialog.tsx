'use client'

import { Suspense, useCallback } from 'react'

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
  onSuccess,
}: {
  petitionSlug?: string
  countryCode: SupportedCountryCodes
  onSuccess: () => void
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
      onSuccess={onSuccess}
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
  onSuccess,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  petitionSlug?: string
  countryCode: SupportedCountryCodes
  onSuccess?: () => void
}) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: 'User Action Form Petition Signature',
  })

  const handleSuccess = useCallback(() => {
    dialogProps.onOpenChange(false)
    onSuccess?.()
  }, [dialogProps, onSuccess])

  return (
    <UserActionFormDialog
      {...dialogProps}
      className={cn('!p-0 lg:max-w-[620px]', className)}
      trigger={children}
      countryCode={countryCode}
    >
      <Suspense fallback={<UserActionFormPetitionSignatureSkeleton />}>
        <UserActionFormPetitionSignatureDialogContent
          countryCode={countryCode}
          onSuccess={handleSuccess}
          petitionSlug={petitionSlug}
        />
      </Suspense>
    </UserActionFormDialog>
  )
}
