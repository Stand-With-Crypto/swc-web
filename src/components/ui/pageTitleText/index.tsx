import { cn, twNoop } from '@/utils/web/cn'
import { type VariantProps, cva } from 'class-variance-authority'
import React from 'react'
import Balancer from 'react-wrap-balancer'

const titleVariantsConfig = {
  size: {
    lg: twNoop('text-4xl md:text-5xl lg:text-6xl'),
    md: twNoop('text-3xl md:text-4xl lg:text-5xl'),
    sm: twNoop('text-xl md:text-2xl lg:text-3xl'),
  },
}

const pageTitleVariants = cva('text-center text-3xl font-bold md:text-4xl lg:text-5xl', {
  defaultVariants: {
    size: 'lg',
  },
  variants: titleVariantsConfig,
})

interface PageTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof pageTitleVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
  withoutBalancer?: boolean
}

export const PageTitle = React.forwardRef<HTMLHeadingElement, PageTitleProps>(
  ({ className, children, as: Comp = 'h1', size, withoutBalancer, ...props }, ref) => {
    return (
      <Comp className={cn(pageTitleVariants({ className, size }))} ref={ref} {...props}>
        {withoutBalancer ? children : <Balancer>{children}</Balancer>}
      </Comp>
    )
  },
)
PageTitle.displayName = 'PageTitle'
