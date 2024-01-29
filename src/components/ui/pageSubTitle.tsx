import { cn, twNoop } from '@/utils/web/cn'
import { type VariantProps, cva } from 'class-variance-authority'
import React from 'react'
import Balancer from 'react-wrap-balancer'

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
  withoutBalancer?: boolean
}

export const PageSubTitle = React.forwardRef<HTMLHeadingElement, PageSubTitleProps>(
  ({ className, children, as: Comp = 'h2', size, withoutBalancer, ...props }, ref) => {
    return (
      <Comp ref={ref} className={cn(variants({ className, size }))} {...props}>
        {withoutBalancer ? children : <Balancer>{children}</Balancer>}
      </Comp>
    )
  },
)
PageSubTitle.displayName = 'PageSubTitle'
