import { HTMLAttributes } from 'react'

import { cn } from '@/utils/web/cn'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  childrenClassName?: string
}

function Skeleton({ className, childrenClassName, children, ...props }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props}>
      {children && <span className={cn('invisible', childrenClassName)}>{children}</span>}
    </div>
  )
}

export { Skeleton }
