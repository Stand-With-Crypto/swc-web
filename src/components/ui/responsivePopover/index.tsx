'use client'

import React from 'react'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useIsMobile } from '@/hooks/useIsMobile'
import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'
import { trackPrimitiveComponentAnalytics } from '@/utils/web/primitiveComponentAnalytics'

// We want to track consistently between mobile and desktop popovers
const ResponsivePopoverDrawerRoot = ({
  analytics,
  ...props
}: React.ComponentPropsWithoutRef<typeof Drawer>) => {
  return (
    <Drawer
      analytics={React.useCallback(
        (open: boolean) =>
          trackPrimitiveComponentAnalytics(
            ({ properties }) => {
              trackClientAnalytic(`Popover ${open ? 'Opened' : 'Closed'}`, {
                action: AnalyticActionType.view,
                component: AnalyticComponentType.dropdown,
                ...properties,
              })
            },
            { analytics, args: open },
          ),
        [analytics],
      )}
      {...props}
    />
  )
}

export function useResponsivePopover() {
  const isMobile = useIsMobile()
  return React.useMemo(
    () => ({
      Popover: isMobile ? ResponsivePopoverDrawerRoot : Popover,
      PopoverContent: isMobile ? DrawerContent : PopoverContent,
      PopoverTitle: isMobile ? DrawerTitle : DrawerHeader,
      PopoverTrigger: isMobile ? DrawerTrigger : PopoverTrigger,
      isMobile,
    }),
    [isMobile],
  )
}
