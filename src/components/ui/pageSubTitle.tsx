import { cn } from '@/utils/web/cn'
import React from 'react'
import Balancer from 'react-wrap-balancer'

export const PageSubTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }
>(({ className, children, as: Comp = 'h2', ...props }, ref) => {
  return (
    <Comp
      ref={ref}
      className={cn('text-center text-sm text-gray-500 lg:text-base', className)}
      {...props}
    >
      <Balancer>{children}</Balancer>
    </Comp>
  )
})
PageSubTitle.displayName = 'PageSubTitle'
