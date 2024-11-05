import { NextImage } from '@/components/ui/image'
import { ExternalLink } from '@/components/ui/link'
import { cn } from '@/utils/web/cn'

export function DDHQFooter({ className }: { className?: string }) {
  return (
    <div className={cn('relative top-20 mx-auto max-w-3xl', className)}>
      <p>Election data sourced from</p>
      <div className="mx-auto mt-4">
        <ExternalLink className="inline-block" href="https://decisiondeskhq.com">
          <NextImage
            alt="Decision Desk logo"
            className="object-contain"
            height={100}
            quality={100}
            src="/partners/ddhq.png"
            width={100}
          />
        </ExternalLink>
      </div>
    </div>
  )
}
