import React from 'react'
import NextLink from 'next/link'

export const InternalLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof NextLink>
>(({ className, ...props }, ref) => {
  return <NextLink className={className} ref={ref} {...props} />
})
InternalLink.displayName = 'InternalLink'

export const ExternalLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => {
  return <a className={className} ref={ref} target="_blank" {...props} />
})
ExternalLink.displayName = 'ExternalLink'
