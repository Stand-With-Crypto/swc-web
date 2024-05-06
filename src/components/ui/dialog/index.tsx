'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

import {
  dialogBodyStyles,
  dialogCloseStyles,
  dialogContentPaddingStyles,
  dialogContentStyles,
  dialogFooterCTAStyles,
  dialogOverlayStyles,
} from '@/components/ui/dialog/styles'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/utils/web/cn'
import { PrimitiveComponentAnalytics } from '@/utils/web/primitiveComponentAnalytics'

import { trackDialogOpen } from './trackDialogOpen'

export type DialogProps = DialogPrimitive.DialogProps & PrimitiveComponentAnalytics<boolean>

function Dialog({ onOpenChange, analytics, ...props }: DialogProps) {
  const wrappedOnChangeOpen = React.useCallback(
    (open: boolean) => {
      trackDialogOpen({ open, analytics })
      onOpenChange?.(open)
    },
    [onOpenChange, analytics],
  )
  return <DialogPrimitive.Root onOpenChange={wrappedOnChangeOpen} {...props} />
}

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay className={cn(dialogOverlayStyles, className)} ref={ref} {...props} />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  padding?: boolean
  closeClassName?: string
  forceAutoFocus?: boolean
}
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    {
      className,
      children,
      padding = true,
      forceAutoFocus = false,
      onOpenAutoFocus,
      closeClassName = '',
      ...props
    },
    ref,
  ) => {
    const isMobile = useIsMobile()
    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(dialogContentStyles, padding && dialogContentPaddingStyles, className)}
          onOpenAutoFocus={isMobile && !forceAutoFocus ? e => e.preventDefault() : onOpenAutoFocus}
          ref={ref}
          {...props}
        >
          {children}
          <DialogPrimitive.Close className={cn(dialogCloseStyles, closeClassName)} tabIndex={-1}>
            <X size={20} />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    )
  },
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
)
DialogHeader.displayName = 'DialogHeader'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    ref={ref}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(dialogBodyStyles, className)} {...props} />
)
DialogBody.displayName = 'DialogBody'

const DialogFooterCTA = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(dialogFooterCTAStyles, className)} {...props} />
)
DialogFooterCTA.displayName = 'DialogFooterCTA'

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooterCTA,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
