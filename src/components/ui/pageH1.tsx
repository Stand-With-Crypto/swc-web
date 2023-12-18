import { cn } from '@/utils/web/cn'
import React from 'react'
import Balancer from 'react-wrap-balancer'

export const PageH1 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      'text-center text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl',
      className,
    )}
    {...props}
  >
    <Balancer>{children}</Balancer>
  </h1>
))
PageH1.displayName = 'PageH1'
