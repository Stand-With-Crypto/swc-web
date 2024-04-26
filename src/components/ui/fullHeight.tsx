import React from 'react'

import { cn } from '@/utils/web/cn'

const Container = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className={cn('flex min-h-dvh flex-col', className)} ref={ref} {...props} />
  },
)
Container.displayName = 'FullPageHeightContainer'

export const STANDARD_TOP_CONTENT_MARGIN = 40

const Content = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <main
        className={cn('flex flex-col', className)}
        ref={ref}
        style={{ flex: '1 0 auto', marginTop: STANDARD_TOP_CONTENT_MARGIN }}
        {...props}
      />
    )
  },
)
Content.displayName = 'FullPageHeightContent'

export const FullHeight = {
  Container,
  Content,
}
