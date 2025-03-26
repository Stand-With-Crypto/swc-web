'use client'

import React from 'react'
import { useToggle } from 'react-use'
import { ChevronDownIcon } from 'lucide-react'
import Link from 'next/link'

import * as Icons from '@/components/app/navbar/navbarCountryIcons'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdownMenu'
import { useCountryCode } from '@/hooks/useCountryCode'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

interface Option {
  label: React.ReactNode
  value: SupportedCountryCodes
  icon: React.ReactNode
}

const options: Option[] = [
  {
    label: 'United States',
    value: SupportedCountryCodes.US,
    icon: <Icons.USACountryIcon />,
  },
  {
    label: 'United Kingdom',
    value: SupportedCountryCodes.GB,
    icon: <Icons.GreatBritainCountryIcon />,
  },
  {
    label: 'Australia',
    value: SupportedCountryCodes.AU,
    icon: <Icons.AustraliaCountryIcon />,
  },
  {
    label: 'Canada',
    value: SupportedCountryCodes.CA,
    icon: <Icons.CanadaCountryIcon />,
  },
]

export function NavbarCountrySelect() {
  const [isOpen, toggleIsOpen] = useToggle(false)
  const countryCode = useCountryCode()

  const currentOption = options.find(option => option.value === countryCode)
  const sortedOptions = React.useMemo(() => {
    if (!currentOption) {
      return options
    }

    const currentOptionIndex = options.findIndex(option => option.value === currentOption.value)
    const newOptions = [...options]
    newOptions.splice(currentOptionIndex, 1)
    newOptions.unshift(currentOption)
    return newOptions
  }, [currentOption])

  if (!currentOption) {
    return null
  }

  return (
    <DropdownMenu onOpenChange={toggleIsOpen} open={isOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex w-full items-center gap-2 text-base font-bold min-[1096px]:w-auto"
          size="sm"
          variant="primary-cta-outline"
        >
          {currentOption.icon}
          <span>{currentOption.label}</span>
          <ChevronDownIcon
            className="h-4 w-4 transition-transform"
            size={16}
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[calc(100vw-48px)] rounded-3xl min-[1096px]:w-auto">
        {sortedOptions.map(option => {
          return (
            <DropdownMenuItem
              asChild
              className="cursor-pointer data-[disabled]:font-bold data-[disabled]:text-primary-cta data-[disabled]:opacity-100"
              disabled={option.value === currentOption.value}
              key={option.value}
            >
              <Link href={getIntlUrls(option.value).home()}>
                <div className="flex items-center gap-2">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
