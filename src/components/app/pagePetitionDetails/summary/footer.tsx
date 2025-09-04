import React, { useCallback } from 'react'
import { Edit3Icon } from 'lucide-react'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionFormPetitionSignatureDialog } from '@/components/app/userActionFormPetitionSignature/dialog'
import { CheckIcon } from '@/components/app/userActionGridCTAs/icons/checkIcon'
import { Button } from '@/components/ui/button'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface PetitionSummaryFooterProps {
  isClosed?: boolean
  isSigned?: boolean
  petitionSlug?: string
  countryCode: SupportedCountryCodes
  isLoading?: boolean
  onPetitionSigned?: () => void
}

export function PetitionSummaryFooter({
  isClosed,
  isSigned,
  petitionSlug,
  countryCode,
  isLoading,
  onPetitionSigned,
}: PetitionSummaryFooterProps) {
  const handleDialogSuccess = useCallback(() => {
    onPetitionSigned?.()
  }, [onPetitionSigned])

  const renderSignButton = (
    <Button className="w-max gap-2 px-6 lg:w-full" disabled={isLoading} variant="primary-cta">
      <Edit3Icon size={16} />
      <span>
        Sign<span className="hidden lg:inline"> petition</span>
      </span>
    </Button>
  )

  if (isClosed) {
    return (
      <div className="flex h-11 w-max items-center justify-center rounded-full bg-foreground/10 px-6 font-medium text-muted-foreground lg:w-full">
        <span className="hidden lg:block">Petition closed</span>
        <span className="block lg:hidden">Closed</span>
      </div>
    )
  }

  if (isSigned) {
    return (
      <div className="flex h-11 w-max items-center justify-center gap-2 lg:w-full lg:px-6">
        <CheckIcon completed />
        <p className="font-medium text-foreground">Signed</p>
      </div>
    )
  }

  return (
    <LoginDialogWrapper
      authenticatedContent={
        <UserActionFormPetitionSignatureDialog
          countryCode={countryCode}
          onSuccess={handleDialogSuccess}
          petitionSlug={petitionSlug}
        >
          {renderSignButton}
        </UserActionFormPetitionSignatureDialog>
      }
    >
      {renderSignButton}
    </LoginDialogWrapper>
  )
}
