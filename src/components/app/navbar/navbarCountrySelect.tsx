'use client'

import { ReactNode, useCallback } from 'react'
import Cookies from 'js-cookie'
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
import {
  SupportedCountryCodes,
  USER_SELECTED_COUNTRY_COOKIE_NAME,
} from '@/utils/shared/supportedCountries'
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
  const countryCode = useCountryCode()
  const currentOption = options.find(option => option.value === countryCode)

  const handleCountrySelection = useCallback((value: SupportedCountryCodes) => {
    Cookies.set(USER_SELECTED_COUNTRY_COOKIE_NAME, value)
  }, [])

  if (!currentOption) {
    return null
  }

  const countryOptions = [
    currentOption,
    ...options.filter(option => option.value !== currentOption.value),
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="primary-cta-outline">
          <div className="flex items-center gap-2">
            {currentOption.icon} <span className="font-sans font-bold">{currentOption.label}</span>
          </div>
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
              onClick={() => handleCountrySelection(option.value)}
            >
              <Link href={urls.home()}>{option.label}</Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
