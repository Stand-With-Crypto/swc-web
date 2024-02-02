'use client'

import * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'

import { cn } from '@/utils/web/cn'
import {
  PrimitiveComponentAnalytics,
  trackPrimitiveComponentAnalytics,
} from '@/utils/web/primativeComponentAnalytics'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'
import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'

const Drawer = ({
  shouldScaleBackground = true,
  analytics,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root> & PrimitiveComponentAnalytics<boolean>) => {
  const wrappedOnChangeOpen = React.useCallback(
    (open: boolean) => {
      trackPrimitiveComponentAnalytics(
        ({ properties }) => {
          trackClientAnalytic(`Dialog ${open ? 'Opened' : 'Closed'}`, {
            component: AnalyticComponentType.modal,
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
  return (
    <DrawerPrimitive.Root
      shouldScaleBackground={shouldScaleBackground}
      onOpenChange={wrappedOnChangeOpen}
      {...props}
    />
  )
}
Drawer.displayName = 'Drawer'

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/80', className)}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> & { direction?: 'top' | 'bottom' }
>(({ className, children, direction = 'bottom', ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        'fixed inset-x-0 z-50 flex h-auto flex-col border bg-background',
        direction === 'top' ? 'top-0 mb-24 rounded-b-[10px]' : 'bottom-0 mt-24 rounded-t-[10px]',
        className,
      )}
      {...props}
    >
      {direction === 'bottom' && (
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      )}
      {children}
      {direction === 'top' && <div className="mx-auto mb-4 h-2 w-[100px] rounded-full bg-muted" />}
    </DrawerPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = 'DrawerContent'

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('grid gap-1.5 p-4 text-center sm:text-left', className)} {...props} />
)
DrawerHeader.displayName = 'DrawerHeader'

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-auto flex flex-col gap-2 p-4', className)} {...props} />
)
DrawerFooter.displayName = 'DrawerFooter'

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
