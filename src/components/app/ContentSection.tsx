import React from 'react'

import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle, PageTitleProps } from '@/components/ui/pageTitleText'
import { cn } from '@/utils/web/cn'

interface ContentSectionProps {
  title?: React.ReactNode
  subtitle?: React.ReactNode
  children?: React.ReactNode
  className?: string
  titleProps?: PageTitleProps
}

export function ContentSection({
  title,
  subtitle,
  children,
  className,
  titleProps = {},
}: ContentSectionProps) {
  return (
    <section className={cn('space-y-8', className)}>
      {title && (
        <div>
          <PageTitle as="h3" size="sm" {...titleProps}>
            {title}
          </PageTitle>
          {subtitle && (
            <PageSubTitle as="h4" className="mt-4" size="sm">
              {subtitle}
            </PageSubTitle>
          )}
        </div>
      )}
      {children}
    </section>
  )
}
