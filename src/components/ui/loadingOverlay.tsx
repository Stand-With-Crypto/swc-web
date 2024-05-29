import { cva, VariantProps } from 'class-variance-authority'

import { NextImage } from '@/components/ui/image'
import { cn } from '@/utils/web/cn'

const loadingOverlayVariants = cva('', {
  variants: {
    size: {
      lg: 'w-[240px] h-[240px]',
      md: 'w-[180px] h-[180px]',
      sm: 'w-[120px] h-[120px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

// TODO make this actually look good
export function LoadingOverlay({ size }: VariantProps<typeof loadingOverlayVariants>) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-foreground/50">
      <div className={cn('relative', loadingOverlayVariants({ size }))}>
        <div className="animate-pulse">
          <NextImage
            alt="SWC Shield"
            fill
            objectFit="cover"
            sizes="(max-width: 640px) 120px, (max-width: 768px) 180px, 240px"
            src="/logo/shield.png"
          />
        </div>
      </div>
    </div>
  )
}
