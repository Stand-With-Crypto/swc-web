import React from 'react'

import { cn } from '@/utils/web/cn'

export function DTSIPersonHeroCardRow({
  children,
  forceMobile = false,
  className,
}: {
  children: React.ReactNode
  forceMobile?: boolean
  className?: string
}) {
  return (
    <section className="text-center">
      <div
        className={cn(
          'flex w-auto flex-col flex-wrap justify-center gap-6 px-2',
          {
            'sm:inline-flex sm:flex-row md:px-4': !forceMobile,
          },
          className,
        )}
      >
        {children}
      </div>
    </section>
  )
}
