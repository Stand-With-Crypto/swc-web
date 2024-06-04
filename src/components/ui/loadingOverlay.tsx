import { cva, VariantProps } from 'class-variance-authority'
import { Dot } from 'lucide-react'

import { cn } from '@/utils/web/cn'

const loadingOverlayVariants = cva('', {
  variants: {
    size: {
      md: '',
      sm: 'scale-75',
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
      <div className={cn(loadingOverlayVariants({ size }))}>
        <div className="border-fontcolor-primary h-16 w-16 animate-spin rounded-full border-4">
          <Dot className="relative top-[40px] h-[30px] w-[30px] text-primary" />
        </div>
      </div>
    </div>
  )
}
