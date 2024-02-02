import { cn, twNoop } from '@/utils/web/cn'
import { type VariantProps, cva } from 'class-variance-authority'
import React from 'react'

const variantsConfig = {
  size: {
    lg: twNoop('text-base lg:text-xl'),
    md: twNoop('text-base'),
  },
}

const variants = cva('text-center text-fontcolor-muted', {
  variants: variantsConfig,
  defaultVariants: {
    size: 'lg',
  },
})

interface PageSubTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof variants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'
}

export const PageSubTitle = React.forwardRef<HTMLHeadingElement, PageSubTitleProps>(
  ({ className, children, as: Comp = 'h2', size, ...props }, ref) => {
    return (
      <Comp ref={ref} className={cn(variants({ className, size }))} {...props}>
        {children}
      </Comp>
    )
  },
)
PageSubTitle.displayName = 'PageSubTitle'
