import { cn, twNoop } from '@/utils/web/cn'
import { type VariantProps, cva } from 'class-variance-authority'
import React from 'react'
import Balancer from 'react-wrap-balancer'

const titleVariantsConfig = {
  size: {
    lg: twNoop('text-3xl md:text-4xl lg:text-5xl'),
    md: twNoop('text-2xl md:text-3xl lg:text-4xl'),
    sm: twNoop('text-lg md:text-xl lg:text-2xl'),
  },
}

const pageTitleVariants = cva('text-center text-3xl font-bold md:text-4xl lg:text-5xl', {
  variants: titleVariantsConfig,
  defaultVariants: {
    size: 'lg',
  },
})

interface PageTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof pageTitleVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'
}

export const PageTitle = React.forwardRef<HTMLHeadingElement, PageTitleProps>(
  ({ className, children, as: Comp = 'h1', size, ...props }, ref) => {
    return (
      <Comp ref={ref} className={cn(pageTitleVariants({ className, size }))} {...props}>
        <Balancer>{children}</Balancer>
      </Comp>
    )
  },
)
PageTitle.displayName = 'PageTitle'
