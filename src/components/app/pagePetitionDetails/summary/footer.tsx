import { Edit3Icon } from 'lucide-react'

import { CheckIcon } from '@/components/app/userActionGridCTAs/icons/checkIcon'
import { Button } from '@/components/ui/button'

interface PetitionSummaryFooterProps {
  isClosed?: boolean
  isSigned?: boolean
  onSign?: () => void
}

export function PetitionSummaryFooter({ isClosed, isSigned, onSign }: PetitionSummaryFooterProps) {
  if (isClosed) {
    return (
      <div className="flex h-11 w-full items-center justify-center rounded-full bg-foreground/10 font-medium text-muted-foreground">
        Petition closed
      </div>
    )
  }

  if (isSigned) {
    return (
      <div className="flex h-11 w-full items-center justify-center gap-2">
        <CheckIcon completed />
        <p className="font-medium text-foreground">Signed</p>
      </div>
    )
  }

  return (
    <Button className="w-max gap-2 px-6 lg:w-full" onClick={onSign} variant="primary-cta">
      <Edit3Icon size={16} />
      Sign
    </Button>
  )
}
