'use client'
import { Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useCopyTextToClipboard } from '@/hooks/useCopyTextToClipboard'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { externalUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface UserReferralUrlProps {
  referralId: string
  className?: string
}

export function UserReferralUrl(props: UserReferralUrlProps) {
  const { referralId, className } = props

  const [_, handleCopyToClipboard] = useCopyTextToClipboard()
  const fullUrl = externalUrls.swcReferralUrl({ referralId: props.referralId })
  const presentationUrl = externalUrls
    .swcReferralUrl({ referralId })
    .replace('https://www.', '')
    .replace('/join/', '/join/\n')

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
        <span className="whitespace-pre-wrap text-start sm:whitespace-normal">
          {presentationUrl}
        </span>

        <div className="rounded-full p-4 hover:bg-secondary">
          <Copy height={26} width={26} />
        </div>
      </Button>
    </div>
  )
}

export function UserReferralUrlWithApi() {
  const { data, isLoading } = useApiResponseForUserFullProfileInfo()
  const hasHydrated = useHasHydrated()

  if (!data?.user || isLoading || !hasHydrated) {
    return null
  }

  return <UserReferralUrl referralId={data.user.referralId} />
}
