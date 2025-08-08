import React from 'react'

import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle, PageTitleProps } from '@/components/ui/pageTitleText'
import { cn } from '@/utils/web/cn'

export function PageLayout({
  className,
  ...props
}: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn('standard-spacing-from-navbar container', className)} {...props} />
}

export function PageLayoutTitle({ children, ...props }: React.PropsWithChildren<PageTitleProps>) {
  return (
    <PageTitle className="mb-6" {...props}>
      {children}
    </PageTitle>
  )
}
PageLayout.Title = PageLayoutTitle

export function PageLayoutSubtitle({ children }: { children: React.ReactNode }) {
  return <PageSubTitle className="mb-10">{children}</PageSubTitle>
}
PageLayout.Subtitle = PageLayoutSubtitle
