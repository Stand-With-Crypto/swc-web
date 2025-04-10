import React from 'react'
import NextLink from 'next/link'

import { cn } from '@/utils/web/cn'

export type InternalLinkProps = React.ComponentProps<typeof NextLink>

export const InternalLink = React.forwardRef<HTMLAnchorElement, InternalLinkProps>(
  ({ className, ...props }, ref) => {
    return (
      <NextLink
        className={cn('text-primary-cta hover:underline', className)}
        ref={ref}
        {...props}
      />
    )
  },
)
InternalLink.displayName = 'InternalLink'

export const ExternalLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => {
  return (
    <a
      className={cn('text-primary-cta hover:underline', className)}
      ref={ref}
      target="_blank"
      {...props}
    />
  )
})
ExternalLink.displayName = 'ExternalLink'
