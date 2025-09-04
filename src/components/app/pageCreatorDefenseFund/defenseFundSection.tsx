import { ReactNode } from 'react'

import { NextImage } from '@/components/ui/image'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { cn } from '@/utils/web/cn'

interface DefenseFundSectionProps {
  heading: ReactNode
  iconSrc?: string
  subtext?: ReactNode
  children?: ReactNode
  headingClassName?: string
  sectionClassName?: string
  childrenWrapperClassName?: string
}

export function DefenseFundSection({
  heading,
  iconSrc,
  subtext,
  children,
  headingClassName,
  sectionClassName,
  childrenWrapperClassName,
}: DefenseFundSectionProps) {
  return (
    <section className={cn('mt-10', sectionClassName)}>
      <div className="container flex flex-col items-center gap-4">
        {iconSrc && (
          <NextImage
            alt="defense fund icon"
            height={48}
            src={iconSrc}
            style={{ width: 48, height: 48 }}
            width={48}
          />
        )}
        <PageSubTitle className={cn('font-medium text-foreground', headingClassName)} size="lg">
          {heading}
        </PageSubTitle>
        {subtext && <p className="text-center text-base text-muted-foreground">{subtext}</p>}
      </div>
      {children && (
        <div className={cn('mt-6 flex items-center justify-center', childrenWrapperClassName)}>
          {children}
        </div>
      )}
    </section>
  )
}
