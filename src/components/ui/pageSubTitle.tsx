import { cn, twNoop } from '@/utils/web/cn'
import { cva } from 'class-variance-authority'
import React from 'react'
import Balancer from 'react-wrap-balancer'

const subTitleVariantsConfig = {
  size: {
    md: twNoop('text-base lg:text-xl'),
    sm: twNoop('text-sm lg:text-base'),
  },
}

const pageSubTitleVariants = cva('text-center text-fontcolor-muted', {
  variants: subTitleVariantsConfig,
  defaultVariants: {
    size: 'md',
  },
})

export const PageSubTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    withoutBalancer?: boolean
    size?: 'md' | 'sm'
  }
>(({ className, children, size = 'md', as: Comp = 'h2', withoutBalancer, ...props }, ref) => {
  return (
    <Comp ref={ref} className={pageSubTitleVariants({ size, className })} {...props}>
      {withoutBalancer ? children : <Balancer>{children}</Balancer>}
    </Comp>
  )
})
PageSubTitle.displayName = 'PageSubTitle'
