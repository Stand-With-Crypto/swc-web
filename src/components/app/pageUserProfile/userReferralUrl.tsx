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
  const url = externalUrls.swcReferralUrl({ referralId }).replace('https://www.', '')
  const formattedUrl = url.replace('/join/', '/join/\n')
  const fullUrl = externalUrls.swcReferralUrl({ referralId: props.referralId })

  const handleCopy = () => handleCopyToClipboard(fullUrl)

  return (
    <div className="relative flex w-full items-center">
      <div
        className={cn(
          'flex min-h-16 w-full cursor-pointer items-center rounded-lg border bg-background p-4 text-lg',
          'whitespace-pre-wrap sm:whitespace-normal',
          'transition-all hover:border-primary-cta hover:bg-muted/75 active:bg-muted',
          className,
        )}
        onClick={handleCopy}
        role="button"
      >
        {formattedUrl}
        <div className="absolute right-3">
          <Button
            className="hover:bg-background/80"
            onClick={e => {
              e.stopPropagation()
              handleCopy()
            }}
            variant="ghost"
          >
            <Copy height={26} width={26} />
          </Button>
        </div>
      </div>
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
