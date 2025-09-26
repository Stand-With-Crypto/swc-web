import React from 'react'

import { CheckIcon } from '@/components/app/userActionGridCTAs/icons/checkIcon'

interface MilestoneItemProps {
  label: string
  isComplete: boolean
}

export function MilestoneItem({ label, isComplete }: MilestoneItemProps) {
  return (
    <div className="flex w-full items-center justify-between rounded-3xl bg-muted px-8 py-6">
      <p className={'font-medium text-foreground'}>{label}</p>
      <CheckIcon completed={isComplete} />
    </div>
  )
}
