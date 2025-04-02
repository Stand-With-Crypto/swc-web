'use client'

import React from 'react'
import { useToggle } from 'react-use'
import Cookies from 'js-cookie'
import { ChevronDownIcon } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdownMenu'
import { useCountryCode } from '@/hooks/useCountryCode'
import { useEffectOnce } from '@/hooks/useEffectOnce'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
  USER_SELECTED_COUNTRY_COOKIE_NAME,
} from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

interface Option {
  label: string
  value: SupportedCountryCodes
}

const options: Option[] = [
  {
    label: 'United States',
    value: SupportedCountryCodes.US,
  },
  {
    label: 'United Kingdom',
    value: SupportedCountryCodes.GB,
  },
  {
    label: 'Australia',
    value: SupportedCountryCodes.AU,
  },
  {
    label: 'Canada',
    value: SupportedCountryCodes.CA,
  },
].sort((a, b) => a.label.localeCompare(b.label))

export function NavbarCountrySelect() {
  const [isOpen, toggleIsOpen] = useToggle(false)
  const countryCode = useCountryCode()

  const currentOption = options.find(option => option.value === countryCode)

  useEffectOnce(() => {
    Cookies.set(USER_SELECTED_COUNTRY_COOKIE_NAME, countryCode)
  })

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
          <FlagIcon countryCode={currentOption.value} />

          <span>{currentOption.label}</span>
          <ChevronDownIcon
            className="h-4 w-4 transition-transform"
            size={16}
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[calc(100vw-48px)] rounded-3xl min-[1096px]:w-auto">
        {options.map(option => {
          return (
            <DropdownMenuItem
              asChild
              className="cursor-pointer data-[disabled]:font-bold data-[disabled]:text-primary-cta data-[disabled]:opacity-100"
              disabled={option.value === currentOption.value}
              key={option.value}
              onClick={() => {
                Cookies.set(USER_SELECTED_COUNTRY_COOKIE_NAME, option.value)
                window.location.href = getIntlUrls(option.value).home()
              }}
            >
              <div className="flex items-center gap-2">
                <FlagIcon countryCode={option.value} />
                <span>{option.label}</span>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function FlagIcon({ countryCode }: { countryCode: SupportedCountryCodes }) {
  const prefix = countryCode === DEFAULT_SUPPORTED_COUNTRY_CODE ? '' : `/${countryCode}`
  return (
    <div className="w-8">
      <Image
        alt={`${countryCode} flag`}
        height={16}
        priority
        quality={100}
        src={`${prefix}/navbar-select-flag.svg`}
        width={32}
      />
    </div>
  )
}
