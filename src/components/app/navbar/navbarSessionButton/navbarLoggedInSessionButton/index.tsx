'use client'

import { Wallet } from 'lucide-react'
import React from 'react'

import { navbarSessionButtonMessages } from '@/components/app/navbar/navbarSessionButton/navbarSessionButtonClient.messages'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { GetDefineMessageResults } from '@/types'
import { useThirdWeb } from '@/hooks/useThirdWeb'

import { NavbarLoggedInSessionPopoverContent } from './navbarLoggedInSessionPopoverContent'

interface NavbarSessionButtonProps {
  messages: GetDefineMessageResults<typeof navbarSessionButtonMessages>
}

export function NavbarLoggedInSessionButton({ messages }: NavbarSessionButtonProps) {
  const { session, getParsedAddress } = useThirdWeb()

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
