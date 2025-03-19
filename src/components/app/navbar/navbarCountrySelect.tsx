import React from 'react'
import Link from 'next/link'

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

// TODO: replace emojis with flag images
const options: {
  label: React.ReactNode
  value: SupportedCountryCodes
}[] = [
  {
    label: '🇺🇸 United States',
    value: SupportedCountryCodes.US,
  },
  {
    label: '🇬🇧 United Kingdom',
    value: SupportedCountryCodes.GB,
  },
  {
    label: '🇦🇺 Australia',
    value: SupportedCountryCodes.AU,
  },
  {
    label: '🇨🇦 Canada',
    value: SupportedCountryCodes.CA,
  },
]

export function NavbarCountrySelect() {
  const value = useCountryCode()
  const currentOption = options.find(option => option.value === value)

  if (!currentOption) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="primary-cta-outline">{currentOption.label}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {options.map(option => {
          const urls = getIntlUrls(option.value)
          return (
            <DropdownMenuItem asChild disabled={option.value === value} key={option.value}>
              <Link href={urls.home()}>{option.label}</Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
