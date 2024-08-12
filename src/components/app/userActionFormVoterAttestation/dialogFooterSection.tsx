import React from 'react'

import { dialogContentPaddingBottomStyles } from '@/components/ui/dialog/styles'
import { cn } from '@/utils/web/cn'

export function DialogFooterSection({
  children,
  elevate = true,
}: React.PropsWithChildren<{ elevate?: boolean }>) {
  return (
    <div
      className={cn(
        'z-10 mt-auto flex flex-col items-center justify-center py-6 sm:flex-row',
        elevate && 'border border-t',
        dialogContentPaddingBottomStyles,
      )}
      style={{ boxShadow: elevate ? 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' : 'none' }}
    >
      {children}
    </div>
  )
}
