import { cn } from '@/utils/web/cn'
import React from 'react'
import Balancer from 'react-wrap-balancer'
import { Slot } from '@radix-ui/react-slot'

export const PageH1 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { asChild?: boolean }
>(({ className, children, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h1'
  return (
    <Comp
      ref={ref}
      className={cn('text-center text-2xl font-bold  md:text-3xl lg:text-4xl', className)}
      {...props}
    >
      <Balancer>{children}</Balancer>
    </Comp>
  )
})
PageH1.displayName = 'PageH1'
