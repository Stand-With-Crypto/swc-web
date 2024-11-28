import { ReactNode } from 'react'

import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { cn } from '@/utils/web/cn'

interface ToolkitSectionProps {
  heading: ReactNode
  subtext?: ReactNode
  children?: ReactNode
  headingClassName?: string
  sectionClassName?: string
  childrenWrapperClassName?: string
}

export function ToolkitSection({
  heading,
  subtext,
  children,
  headingClassName,
  sectionClassName,
  childrenWrapperClassName,
}: ToolkitSectionProps) {
  return (
    <section className={cn('mt-10', sectionClassName)}>
      <div className="container flex flex-col items-center gap-4">
        <PageSubTitle className={cn('font-medium text-foreground', headingClassName)}>
          {heading}
        </PageSubTitle>
        {subtext && (
          <p className="text-center font-mono text-base text-muted-foreground">{subtext}</p>
        )}
      </div>
      {children && (
        <div className={cn('mt-6 flex items-center justify-center', childrenWrapperClassName)}>
          {children}
        </div>
      )}
    </section>
  )
}
