import React from 'react'

import { useIsMobile } from '@/hooks/useIsMobile'
import {
  DialogHeader,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

export function useResponsiveDialog() {
  const isMobile = useIsMobile()

  return React.useMemo(
    () => ({
      isMobile,
      Dialog: isMobile ? Drawer : Dialog,
      DialogTrigger: isMobile ? DrawerTrigger : DialogTrigger,
      DialogContent: isMobile ? DrawerContent : DialogContent,
      DialogHeader: isMobile ? DrawerHeader : DialogHeader,
      DialogTitle: isMobile ? DrawerTitle : DialogTitle,
    }),
    [isMobile],
  )
}
