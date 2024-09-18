import { ReactNode } from 'react'

import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { cn } from '@/utils/web/cn'

interface PressSectionProps {
  dateHeading?: ReactNode
  heading: ReactNode
  publication: string
  children?: ReactNode
  headingClassName?: string
  sectionClassName?: string
  childrenWrapperClassName?: string
}

export function PressSection({
  dateHeading,
  heading,
  publication,
  children,
  headingClassName,
  sectionClassName,
  childrenWrapperClassName,
}: PressSectionProps) {
  return (
    <section className={sectionClassName}>
      <div className="container flex flex-col items-center gap-2">
        {dateHeading && (
          <p className="text-center font-mono text-sm text-muted-foreground">{dateHeading}</p>
        )}
        <PageSubTitle className={cn('font-bold text-foreground', headingClassName)} size="md">
          {publication}: {heading}
        </PageSubTitle>
      </div>
      {children && (
        <div className={cn('mt-4 flex items-center justify-center', childrenWrapperClassName)}>
          {children}
        </div>
      )}
    </section>
  )
}
