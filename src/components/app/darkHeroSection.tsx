import React from 'react'

import { STANDARD_TOP_CONTENT_MARGIN } from '@/components/ui/fullHeight'
import { cn } from '@/utils/web/cn'

export const DarkHeroSection = React.forwardRef<
  React.ElementRef<'section'>,
  React.HTMLAttributes<HTMLElement>
>(({ className, children, ...props }, ref) => {
  return (
    <section
      className="relative"
      ref={ref}
      /* 
      There's a standard padding we apply to all content across the site. 
      This hack ensures we remove that white space in lieu of the black padding
      */
    >
      <div
        className="absolute w-full bg-black"
        style={{ height: STANDARD_TOP_CONTENT_MARGIN, top: -1 * STANDARD_TOP_CONTENT_MARGIN }}
      />
      <div
        {...props}
        className={cn('bg-black px-4 pb-24 text-white antialiased', className)}
        style={{
          paddingTop: 96 - STANDARD_TOP_CONTENT_MARGIN,
        }}
      >
        {children}
      </div>
    </section>
  )
})
DarkHeroSection.displayName = 'DarkHeroSection'
