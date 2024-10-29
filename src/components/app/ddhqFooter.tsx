import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { cn } from '@/utils/web/cn'

export function DDHQFooter({ className }: { className?: string }) {
  return (
    <div className={cn('relative top-20 mx-auto max-w-3xl', className)}>
      <p>Election data sourced from</p>
      <ExternalLink href="https://decisiondeskhq.com">
        <div className="mx-auto mt-4">
          <NextImage
            alt="Decision Desk logo"
            className="object-contain"
            height={100}
            quality={100}
            src="/partners/ddhq.png"
            width={100}
          />
        </div>
      </ExternalLink>
    </div>
  )
}
