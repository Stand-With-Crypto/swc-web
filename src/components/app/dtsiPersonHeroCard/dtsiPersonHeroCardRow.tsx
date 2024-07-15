import React from 'react'

import { cn } from '@/utils/web/cn'

export function DTSIPersonHeroCardRow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('text-center', className)}>
      <div className="flex w-auto max-w-screen-lg flex-col flex-wrap justify-center gap-6 px-2 sm:inline-flex sm:flex-row md:px-4">
        {children}
      </div>
    </section>
  )
}
