import { Edit3Icon } from 'lucide-react'

import { UserActionFormPetitionSignatureDialog } from '@/components/app/userActionFormPetitionSignature/dialog'
import { CheckIcon } from '@/components/app/userActionGridCTAs/icons/checkIcon'
import { Button } from '@/components/ui/button'

interface PetitionSummaryFooterProps {
  isClosed?: boolean
  isSigned?: boolean
  onSign?: () => void
  petitionSlug?: string
}

export function PetitionSummaryFooter({
  isClosed,
  isSigned,
  onSign,
  petitionSlug,
}: PetitionSummaryFooterProps) {
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
    <UserActionFormPetitionSignatureDialog petitionSlug={petitionSlug}>
      <Button className="w-max gap-2 px-6 lg:w-full" onClick={onSign} variant="primary-cta">
        <Edit3Icon size={16} />
        <span>
          Sign <span className="hidden lg:inline">petition</span>
        </span>
      </Button>
    </UserActionFormPetitionSignatureDialog>
  )
}
