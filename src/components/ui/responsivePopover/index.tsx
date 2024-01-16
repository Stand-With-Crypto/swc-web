'use client'

import React from 'react'

import { useIsMobile } from '@/hooks/useIsMobile'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
  DrawerHeader,
} from '@/components/ui/drawer'

export function useResponsivePopover() {
  const isMobile = useIsMobile()

  return React.useMemo(
    () => ({
      Popover: isMobile ? Drawer : Popover,
      PopoverTrigger: isMobile ? DrawerTrigger : PopoverTrigger,
      PopoverContent: isMobile ? DrawerContent : PopoverContent,
      PopoverTitle: isMobile ? DrawerTitle : DrawerHeader,
    }),
    [isMobile],
  )
}
