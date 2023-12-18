import { cn } from '@/utils/web/cn'
import NextLink, { LinkProps as NextLinkProps } from 'next/link'
import React from 'react'

export const InternalLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof NextLink>
>(({ className, ...props }, ref) => {
  return <NextLink ref={ref} className={cn('hover:underline', className)} {...props} />
})
InternalLink.displayName = 'InternalLink'

export const ExternalLink = React.forwardRef<
  HTMLAnchorElement,
  React.LinkHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => {
  return <a target="_blank" className={cn('hover:underline', className)} ref={ref} {...props} />
})
ExternalLink.displayName = 'ExternalLink'
