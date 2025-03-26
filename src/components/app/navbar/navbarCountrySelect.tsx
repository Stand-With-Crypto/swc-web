'use client'

import { ReactNode } from 'react'
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

const options: {
  label: ReactNode
  value: SupportedCountryCodes
  icon: ReactNode
}[] = [
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

  if (!currentOption) {
    return null
  }

  const countryOptions = [
    currentOption,
    ...options.filter(option => option.value !== currentOption.value),
  ]

  return (
    <DropdownMenu onOpenChange={toggleIsOpen} open={isOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex items-center gap-2 text-base font-bold"
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
      <DropdownMenuContent>
        {countryOptions.map(option => {
          const urls = getIntlUrls(option.value)
          return (
            <DropdownMenuItem
              asChild
              className="cursor-pointer"
              disabled={option.value === countryCode}
              key={option.value}
            >
              <Link href={urls.home()}>
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
