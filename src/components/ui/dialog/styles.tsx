/*
    Decoupling the styles from the actual component specifically so we want leverage them to build server-rendered
    UX that appears to be a modal but is not for out (homepageDialogDeeplink) use case.
*/

import { twNoop } from '@/utils/web/cn'
import { X } from 'lucide-react'

export const dialogOverlayStyles = twNoop(
  'fixed inset-0 z-50 bg-foreground/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
)
export const dialogContentStyles = twNoop(
  'fixed left-[50%] top-[50%] z-50 grid max-h-screen w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-scroll border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
)
export const dialogCloseStyles = twNoop(
  'absolute right-2 top-2 rounded-sm p-2 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground',
)
