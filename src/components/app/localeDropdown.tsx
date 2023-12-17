'use client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdownMenu'
import { getLocaleFlagEmoji } from '@/intl/localeFlagEmojis'
import { DEFAULT_LOCALE, ORDERED_SUPPORTED_LOCALES, SupportedLocale } from '@/intl/locales'
import { usePathname, useRouter } from 'next/navigation'
import { addDays } from 'date-fns'
import { setCookie } from '@/actions/setCookie'

export function LocaleDropdown({ locale }: { locale: SupportedLocale }) {
  const router = useRouter()
  const currentPathname = usePathname()

  const handleChange = (newLocale: SupportedLocale) => async () => {
    if (newLocale === locale || !currentPathname) return
    // set cookie for next-i18n-router
    const expiresDate = addDays(new Date(), 30)
    await setCookie('NEXT_LOCALE', newLocale, { expires: expiresDate })
    if (locale === DEFAULT_LOCALE) {
      router.push(`/${newLocale}${currentPathname}`)
    } else {
      router.push(currentPathname.replace(`/${locale}`, `/${newLocale}`))
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          {locale} {getLocaleFlagEmoji(locale)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {ORDERED_SUPPORTED_LOCALES.map(supportedLocale => (
          <DropdownMenuItem onClick={handleChange(supportedLocale)} key={supportedLocale}>
            {supportedLocale} {getLocaleFlagEmoji(supportedLocale)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
