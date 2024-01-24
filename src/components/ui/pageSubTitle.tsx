import { cn } from '@/utils/web/cn'
import React from 'react'
import Balancer from 'react-wrap-balancer'

export const PageSubTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    withoutBalancer?: boolean
  }
>(({ className, children, as: Comp = 'h2', withoutBalancer, ...props }, ref) => {
  return (
    <Comp
      ref={ref}
      className={cn('text-center text-base text-fontcolor-muted lg:text-xl', className)}
      {...props}
    >
      {withoutBalancer ? children : <Balancer>{children}</Balancer>}
    </Comp>
  )
})
PageSubTitle.displayName = 'PageSubTitle'
