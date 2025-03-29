'use client'

import * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'

import { VisuallyHidden } from '@/components/ui/visually-hidden'
import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'
import { cn } from '@/utils/web/cn'
import {
  PrimitiveComponentAnalytics,
  trackPrimitiveComponentAnalytics,
} from '@/utils/web/primitiveComponentAnalytics'

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
      onOpenChange={wrappedOnChangeOpen}
      shouldScaleBackground={shouldScaleBackground}
      {...props}
    />
  )
}
Drawer.displayName = 'Drawer'

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    className={cn('fixed inset-0 z-50 bg-black/80', className)}
    ref={ref}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

interface DrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> {
  touchableIndicatorClassName?: string
  direction?: 'top' | 'bottom'
  a11yTitle: string
}
const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Content>,
  DrawerContentProps
>(
  (
    {
      className,
      children,
      touchableIndicatorClassName = '',
      direction = 'bottom',
      a11yTitle,
      ...props
    },
    ref,
  ) => (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        className={cn(
          'fixed inset-x-0 z-50 flex h-auto flex-col border bg-background',
          direction === 'top' ? 'top-0 mb-24 rounded-b-[10px]' : 'bottom-0 mt-24 rounded-t-[10px]',
          className,
        )}
        ref={ref}
        {...props}
      >
        <VisuallyHidden>
          <DrawerPrimitive.Description>{props['aria-describedby']}</DrawerPrimitive.Description>
          <DrawerTitle>{a11yTitle}</DrawerTitle>
        </VisuallyHidden>
        {direction === 'bottom' && (
          <div
            className={cn(
              'mx-auto my-4 h-2 w-[100px] rounded-full bg-muted',
              touchableIndicatorClassName,
            )}
          />
        )}
        {children}
        {direction === 'top' && (
          <div className="mx-auto mb-4 h-2 w-[100px] rounded-full bg-muted" />
        )}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  ),
)
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
  React.ComponentRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    ref={ref}
    {...props}
  />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    className={cn('text-sm text-muted-foreground', className)}
    ref={ref}
    {...props}
  />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
}
