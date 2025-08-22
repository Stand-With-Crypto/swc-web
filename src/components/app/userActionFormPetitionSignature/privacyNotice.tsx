import Link from 'next/link'

import { cn } from '@/utils/web/cn'

interface PrivacyNoticeProps {
  className?: string
}

export function PrivacyNotice({ className }: PrivacyNoticeProps) {
  return (
    <div className={cn('text-center text-xs text-muted-foreground', className)}>
      By submitting, I understand that Stand With Crypto and its vendors may collect and use my
      personal information subject to the{' '}
      <Link className="underline" href="/privacy" target="_blank">
        SWC Privacy Policy
      </Link>
      .
    </div>
  )
}
