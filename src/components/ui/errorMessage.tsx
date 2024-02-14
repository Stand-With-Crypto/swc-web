import React from 'react'

import { cn } from '@/utils/web/cn'

export const ErrorMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p className={cn('text-sm font-medium text-destructive', className)} ref={ref} {...props} />
  )
})
ErrorMessage.displayName = 'ErrorMessage'
