import { cn } from '@/utils/web/cn'
import NextLink from 'next/link'
import React from 'react'

interface LinkProps {
  underlineOnHover?: boolean
}

export const InternalLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof NextLink> & LinkProps
>(({ className, underlineOnHover = true, ...props }, ref) => {
  return (
    <NextLink
      ref={ref}
      className={cn(underlineOnHover && 'hover:underline', className)}
      {...props}
    />
  )
})
InternalLink.displayName = 'InternalLink'

export const ExternalLink = React.forwardRef<
  HTMLAnchorElement,
  React.LinkHTMLAttributes<HTMLAnchorElement> & LinkProps
>(({ className, underlineOnHover = true, ...props }, ref) => {
  return (
    <a
      target="_blank"
      className={cn(underlineOnHover && 'hover:underline', className)}
      ref={ref}
      {...props}
    />
  )
})
ExternalLink.displayName = 'ExternalLink'
