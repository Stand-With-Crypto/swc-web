import React from 'react'

import { cn } from '@/utils/web/cn'

export interface InfoCardProps {
  className?: string
  children: React.ReactNode
  as?: 'div' | 'article'
}

export const InfoCard: React.FC<InfoCardProps> = ({ className, children, as = 'div' }) => {
  const Component = as
  return (
    <Component className={cn('info-card w-full rounded-3xl bg-secondary p-6 sm:p-8', className)}>
      {children}
    </Component>
  )
}

InfoCard.displayName = 'InfoCard'
