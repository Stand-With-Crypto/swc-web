import React from 'react'
import Balancer from 'react-wrap-balancer'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn, twNoop } from '@/utils/web/cn'

export const DEFAULT_PAGE_TITLE_SIZE = 'xl'

const titleVariantsConfig = {
  size: {
    xxs: twNoop('text-base md:text-lg lg:text-lg'),
    xs: twNoop('text-lg md:text-lg lg:text-xl'),
    sm: twNoop('text-lg md:text-xl lg:text-2xl'),
    md: twNoop('text-xl md:text-2xl lg:text-3xl'),
    lg: twNoop('text-3xl md:text-4xl lg:text-5xl'),
    [DEFAULT_PAGE_TITLE_SIZE]: twNoop('text-4xl md:text-5xl lg:text-6xl'),
  },
}

const pageTitleVariants = cva('font-sans text-center font-bold', {
  variants: titleVariantsConfig,
  defaultVariants: {
    size: DEFAULT_PAGE_TITLE_SIZE,
  },
})

export interface PageTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof pageTitleVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
  withoutBalancer?: boolean
}

const getSizeFromComp = (Comp: PageTitleProps['as']) => {
  switch (Comp) {
    case 'h1':
      return DEFAULT_PAGE_TITLE_SIZE
    case 'h2':
      return 'lg'
    case 'h3':
      return 'md'
    case 'h4':
      return 'sm'
    case 'h5':
    case 'h6':
      return 'xs'
    default:
      return DEFAULT_PAGE_TITLE_SIZE
  }
}

export const PageTitle = React.forwardRef<HTMLHeadingElement, PageTitleProps>(
  ({ className, children, as: Comp = 'h1', size, withoutBalancer, ...props }, ref) => {
    const computedSize = size || getSizeFromComp(Comp)
    return (
      <Comp
        className={cn(pageTitleVariants({ className, size: computedSize }))}
        ref={ref}
        {...props}
      >
        {withoutBalancer ? children : <Balancer>{children}</Balancer>}
      </Comp>
    )
  },
)
PageTitle.displayName = 'PageTitle'
