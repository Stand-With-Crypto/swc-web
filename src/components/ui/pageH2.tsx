import { cn } from '@/utils/web/cn'
import { Slot } from '@radix-ui/react-slot'
import React from 'react'
import Balancer from 'react-wrap-balancer'

export const PageH2 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { asChild?: boolean }
>(({ className, children, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h2'
  return (
    <Comp ref={ref} className={cn('text-center text-sm text-gray-500', className)} {...props}>
      <Balancer>{children}</Balancer>
    </Comp>
  )
})
PageH2.displayName = 'PageH2'
