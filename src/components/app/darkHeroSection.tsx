import React from 'react'

import { cn } from '@/utils/web/cn'

export const DarkHeroSection = React.forwardRef<
  React.ElementRef<'section'>,
  React.HTMLAttributes<HTMLElement>
>(({ className, children, ...props }, ref) => {
  return (
    <section
      ref={ref}
      {...props}
      className={cn('relative bg-black px-4 py-24 text-white antialiased', className)}
    >
      {children}
    </section>
  )
})
DarkHeroSection.displayName = 'DarkHeroSection'
