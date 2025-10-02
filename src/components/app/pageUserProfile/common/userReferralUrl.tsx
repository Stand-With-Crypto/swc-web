'use client'
import { Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useCopyTextToClipboard } from '@/hooks/useCopyTextToClipboard'
import { useCountryCode } from '@/hooks/useCountryCode'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useSession } from '@/hooks/useSession'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { externalUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

interface UserReferralUrlProps {
  referralId: string
  className?: string
  countryCode?: SupportedCountryCodes
}

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      copiedToClipboard: 'Copied to clipboard',
    },
    de: {
      copiedToClipboard: 'In Zwischenablage kopiert',
    },
    fr: {
      copiedToClipboard: 'Copié dans le presse-papiers',
    },
  },
})

export function UserReferralUrl(props: UserReferralUrlProps) {
  const { t } = useTranslation(i18nMessages, 'UserReferralUrl')
  const { referralId, className, countryCode } = props

  const [_, handleCopyToClipboard, hasCopied] = useCopyTextToClipboard()
  const fullUrl = externalUrls.swcReferralUrl({ referralId, countryCode })
  const presentationUrl = fullUrl
    .replace(/https?:\/\/(www\.)?/, '')
    .replace('/join/', '/join/\u200B')

  const handleCopy = () => handleCopyToClipboard(fullUrl)

  return (
    <div className="relative flex w-full items-center">
      <Button
        className={cn(
          'min-h-16 w-full justify-between rounded-lg px-4 py-2 text-lg font-normal',
          'transition-all hover:border-primary-cta hover:bg-secondary/25 active:bg-secondary',
          className,
        )}
        onClick={handleCopy}
        size="lg"
        variant="outline"
      >
        <span className="whitespace-pre-wrap text-start">{presentationUrl}</span>

        <TooltipProvider>
          <Tooltip open={hasCopied}>
            <TooltipTrigger asChild>
              <div className="rounded-full p-4 hover:bg-secondary">
                <Copy height={26} width={26} />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs" side="top">
              <p className="text-sm font-normal tracking-normal">{t('copiedToClipboard')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Button>
    </div>
  )
}

export function UserReferralUrlWithApi() {
  const { data, isLoading } = useApiResponseForUserFullProfileInfo()
  const countryCode = useCountryCode()
  const hasHydrated = useHasHydrated()

  const { isLoggedIn, isLoading: isSessionLoading } = useSession()

  if (hasHydrated && isLoggedIn && (isLoading || isSessionLoading)) {
    return <Skeleton className="h-[76px] w-full" />
  }

  if (!data?.user || isLoading || !hasHydrated) {
    return null
  }

  return <UserReferralUrl countryCode={countryCode} referralId={data.user.referralId} />
}
