import { DialogProps } from '@/components/ui/dialog'
import { useState } from 'react'

interface UseDialogOptions {
  initialOpen?: boolean
  analytics: string
}

interface UseDialogReturn {
  open: NonNullable<DialogProps['open']>
  onOpenChange: NonNullable<DialogProps['onOpenChange']>
  analytics: NonNullable<DialogProps['analytics']>
}

export function useDialog({ initialOpen = false, analytics }: UseDialogOptions): UseDialogReturn {
  const [open, onOpenChange] = useState(initialOpen)
  return { analytics, onOpenChange, open }
}
