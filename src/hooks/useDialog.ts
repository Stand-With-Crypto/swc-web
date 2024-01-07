import { Dialog } from '@/components/ui/dialog'
import { useState } from 'react'

export const useDialog = (
  initial: boolean,
): {
  open: boolean
  onOpenChange(open: boolean): void
} => {
  const [open, onOpenChange] = useState(initial)
  return { open, onOpenChange }
}
