'use client'
import { Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input, InputProps } from '@/components/ui/input'
import { useCopyTextToClipboard } from '@/hooks/useCopyTextToClipboard'
import { externalUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface UserReferralUrlProps extends Partial<InputProps> {
  referralId: string
}

export function UserReferralUrl(props: UserReferralUrlProps) {
  const { referralId, ...inputProps } = props

  const [_, handleCopyToClipboard] = useCopyTextToClipboard()

  return (
    <div className="relative flex w-full items-center">
      <Input
        disabled
        readOnly
        value={externalUrls.swcReferralUrl({ referralId }).replace('https://www.', '')}
        {...inputProps}
        className={cn('h-16 pr-12 text-lg !opacity-95', inputProps.className)}
      />

      <div className="absolute right-0">
        <Button
          onClick={() =>
            handleCopyToClipboard(externalUrls.swcReferralUrl({ referralId: props.referralId }))
          }
          variant="ghost"
        >
          <Copy height={26} width={26} />
        </Button>
      </div>
    </div>
  )
}
