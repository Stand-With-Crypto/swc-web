import { cn } from '@/utils/web/cn'
import React from 'react'
import Balancer from 'react-wrap-balancer'

export const PageH2 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      'text-center text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl',
      className,
    )}
    {...props}
  >
    <Balancer>{children}</Balancer>
  </h2>
))
PageH2.displayName = 'PageH2'
