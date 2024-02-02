import NextLink from 'next/link'
import React from 'react'

export const InternalLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof NextLink>
>(({ className, ...props }, ref) => {
  return <NextLink ref={ref} className={className} {...props} />
})
InternalLink.displayName = 'InternalLink'

export const ExternalLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => {
  return <a target="_blank" className={className} ref={ref} {...props} />
})
ExternalLink.displayName = 'ExternalLink'
