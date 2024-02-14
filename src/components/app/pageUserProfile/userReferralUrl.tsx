'use client'
import { Copy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCopyTextToClipboard } from '@/hooks/useCopyTextToClipboard'
import { externalUrls } from '@/utils/shared/urls'

export function UserReferralUrl(props: { referralId: string }) {
  const [_, handleCopyToClipboard] = useCopyTextToClipboard()

  return (
    <div className="flex items-center justify-center">
      <Input
        className="inline-block w-[305px] !opacity-95"
        disabled
        value={externalUrls
          .swcReferralUrl({ referralId: props.referralId })
          .replace('https://www.', '')}
      />
      <Button
        onClick={() =>
          handleCopyToClipboard(externalUrls.swcReferralUrl({ referralId: props.referralId }))
        }
        variant="link"
      >
        <Copy height={16} width={16} />
      </Button>
    </div>
  )
}
