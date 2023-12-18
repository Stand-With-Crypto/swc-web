import { cn } from '@/utils/web/cn'
import React from 'react'

const Container = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, style, asChild = false, ...props }, ref) => {
  return (
    <div
      className={cn('flex flex-col', className)}
      // https://stackoverflow.com/questions/74144034/why-is-the-css-height100vh-rule-exceeding-the-viewport-height-on-mobile-device
      style={{ ...style, minHeight: '100dvh' }}
      ref={ref}
      {...props}
    />
  )
})
Container.displayName = 'FullPageHeightContainer'

const Content = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  return (
    <main
      className={cn('flex flex-col', className)}
      style={{ flex: '1 0 auto' }}
      ref={ref}
      {...props}
    />
  )
})
Content.displayName = 'FullPageHeightContent'

export const FullHeight = {
  Container,
  Content,
}
