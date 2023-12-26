import { cn } from '@/utils/web/cn'
import React from 'react'
import Balancer from 'react-wrap-balancer'

export const PageTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }
>(({ className, children, as: Comp = 'h1', ...props }, ref) => {
  return (
    <Comp
      ref={ref}
      className={cn('text-center text-3xl font-bold  md:text-4xl lg:text-5xl', className)}
      {...props}
    >
      <Balancer>{children}</Balancer>
    </Comp>
  )
})
PageTitle.displayName = 'PageTitle'
