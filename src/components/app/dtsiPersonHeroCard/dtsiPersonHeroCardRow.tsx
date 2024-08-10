import React from 'react'

import { cn } from '@/utils/web/cn'

export function DTSIPersonHeroCardRow({
  children,
  className,
  forceMobile = false,
}: {
  children: React.ReactNode
  className?: string
  forceMobile?: boolean
}) {
  return (
    <section className={cn('text-center', className)}>
      <div
        className={cn(
          'flex w-auto flex-col flex-wrap justify-center gap-6 px-2',
          !forceMobile && 'sm:inline-flex sm:flex-row md:px-4',
        )}
      >
        {children}
      </div>
    </section>
  )
}
