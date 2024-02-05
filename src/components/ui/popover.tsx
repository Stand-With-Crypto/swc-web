'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'

import { cn } from '@/utils/web/cn'
import {
  PrimitiveComponentAnalytics,
  trackPrimitiveComponentAnalytics,
} from '@/utils/web/primitiveComponentAnalytics'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'
import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'

const Popover = ({
  analytics,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root> & PrimitiveComponentAnalytics<boolean>) => {
  const wrappedOnChangeOpen = React.useCallback(
    (open: boolean) => {
      trackPrimitiveComponentAnalytics(
        ({ properties }) => {
          trackClientAnalytic(`Popover ${open ? 'Opened' : 'Closed'}`, {
            component: AnalyticComponentType.dropdown,
            action: AnalyticActionType.view,
            ...properties,
          })
        },
        { args: open, analytics },
      )
      onOpenChange?.(open)
    },
    [onOpenChange, analytics],
  )
  return <PopoverPrimitive.Root onOpenChange={wrappedOnChangeOpen} {...props} />
}
const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
