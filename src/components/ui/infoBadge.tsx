'use client'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Info } from 'lucide-react'
import React from 'react'

// This is not using Tooltip because it has some issues with autoFocus when inside modals and popovers
// See https://github.com/radix-ui/primitives/issues/2248
export default function InfoBadge({ children }: React.PropsWithChildren) {
  return (
    <Popover>
      <PopoverTrigger>
        <Info className="h-4 w-4" />
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-[100vw] bg-muted">
        <p className="prose prose-sm text-inherit">{children}</p>
      </PopoverContent>
    </Popover>
  )
}
