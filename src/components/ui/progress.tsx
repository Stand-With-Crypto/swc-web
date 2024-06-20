'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/utils/web/cn'

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    className={cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)}
    ref={ref}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="to h-full w-full flex-1 rounded-full bg-gradient-to-r from-purple-500/60 via-purple-600 to-purple-700 transition-transform"
      style={{
        transform: `translateX(-${100 - (value || 0)}%)`,
        backgroundSize: `${value || 0}% 100%`,
        backgroundPositionX: `100%`,
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
