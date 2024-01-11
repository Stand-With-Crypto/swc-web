'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { useThirdWeb } from '@/hooks/useThirdWeb'

import { NavbarLoggedInSessionPopoverContent } from './navbarLoggedInSessionPopoverContent'
import { useResponsivePopover } from '@/components/ui/responsivePopover'

export function NavbarLoggedInSessionButton() {
  const { getParsedAddress } = useThirdWeb()

  const { Popover, PopoverContent, PopoverTrigger } = useResponsivePopover()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" className="min-w-[120px]">
          <div>{getParsedAddress({ numStartingChars: 2 })}</div>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0">
        <NavbarLoggedInSessionPopoverContent />
      </PopoverContent>
    </Popover>
  )
}
