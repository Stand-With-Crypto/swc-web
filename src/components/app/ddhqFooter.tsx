import { NextImage } from '@/components/ui/image'
import { cn } from '@/utils/web/cn'

export function DDHQFooter({ className }: { className?: string }) {
  return (
    <div className={cn('mx-auto max-w-3xl text-center', className)}>
      <p>Election data sourced from</p>
      <NextImage
        alt="Decision Desk HQ"
        className="mx-auto mt-4"
        height={100}
        src="/partners/ddhq.png"
        width={100}
      />
    </div>
  )
}
