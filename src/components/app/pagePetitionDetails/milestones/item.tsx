import React from 'react'

import { CheckIcon } from '@/components/app/userActionGridCTAs/icons/checkIcon'
import { cn } from '@/utils/web/cn'

interface MilestoneItemProps {
  label: string
  isComplete: boolean
}

export function MilestoneItem({ label, isComplete }: MilestoneItemProps) {
  return (
    <div className="flex w-full items-center justify-between rounded-3xl bg-muted px-8 py-6">
      <p className={cn('font-medium', isComplete ? 'text-foreground' : 'text-muted-foreground')}>
        {label}
      </p>
      <CheckIcon completed={isComplete} />
    </div>
  )
}
