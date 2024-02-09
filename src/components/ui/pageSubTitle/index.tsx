import React from 'react'
import Balancer from 'react-wrap-balancer'
import { cva, VariantProps } from 'class-variance-authority'

import { cn, twNoop } from '@/utils/web/cn'

const subTitleVariantsConfig = {
  size: {
    lg: twNoop('text-base lg:text-xl'),
    md: twNoop('text-base'),
    sm: twNoop('text-sm lg:text-base'),
  },
}

const pageSubTitleVariants = cva('text-center text-fontcolor-muted', {
  variants: subTitleVariantsConfig,
  defaultVariants: {
    size: 'lg',
  },
})

interface PageSubTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof pageSubTitleVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'
  withoutBalancer?: boolean
}

export const PageSubTitle = React.forwardRef<HTMLHeadingElement, PageSubTitleProps>(
  ({ className, children, size = 'md', as: Comp = 'h2', withoutBalancer, ...props }, ref) => {
    return (
      <Comp className={cn(pageSubTitleVariants({ size, className }))} ref={ref} {...props}>
        {withoutBalancer ? children : <Balancer>{children}</Balancer>}
      </Comp>
    )
  },
)
PageSubTitle.displayName = 'PageSubTitle'
