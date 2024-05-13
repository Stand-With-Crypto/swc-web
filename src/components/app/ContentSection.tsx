import React from 'react'

import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { cn } from '@/utils/web/cn'

export interface ContentSectionProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function ContentSection({ title, subtitle, children, className }: ContentSectionProps) {
  return (
    <section className={cn('space-y-8', className)}>
      <div>
        <PageTitle as="h3" size="sm">
          {title}
        </PageTitle>
        {subtitle && (
          <PageSubTitle as="h4" className="mt-4" size="sm">
            {subtitle}
          </PageSubTitle>
        )}
      </div>
      {children}
    </section>
  )
}
