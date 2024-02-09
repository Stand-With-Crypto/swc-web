import { useState } from 'react'

import { DialogProps } from '@/components/ui/dialog'

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
  return { open, onOpenChange, analytics }
}
