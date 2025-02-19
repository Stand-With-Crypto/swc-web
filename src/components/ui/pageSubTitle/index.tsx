import React from 'react'
import Balancer from 'react-wrap-balancer'
import { cva, VariantProps } from 'class-variance-authority'

import { cn, twNoop } from '@/utils/web/cn'

const DEFAULT_SIZE = 'md'

export const subTitleVariantsConfig = {
  size: {
    sm: twNoop('text-sm md:text-base'),
    md: twNoop('text-base md:text-lg'),
    lg: twNoop('text-lg md:text-xl'),
    xl: twNoop('text-xl md:text-2xl'),
    '2xl': twNoop('text-2xl md:text-3xl'),
  },
}

export const pageSubTitleVariants = cva('text-center text-fontcolor-muted', {
  variants: subTitleVariantsConfig,
  defaultVariants: {
    size: DEFAULT_SIZE,
  },
})

export const AsVariantsConfig = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'] as const

interface PageSubTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof pageSubTitleVariants> {
  as?: (typeof AsVariantsConfig)[number]
  withoutBalancer?: boolean
}

export const PageSubTitle = React.forwardRef<HTMLHeadingElement, PageSubTitleProps>(
  (
    { className, children, size = DEFAULT_SIZE, as: Comp = 'h2', withoutBalancer, ...props },
    ref,
  ) => {
    return (
      <Comp className={cn(pageSubTitleVariants({ size, className }))} ref={ref} {...props}>
        {withoutBalancer ? children : <Balancer>{children}</Balancer>}
      </Comp>
    )
  },
)
PageSubTitle.displayName = 'PageSubTitle'
