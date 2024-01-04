import { cn, twNoop } from '@/utils/web/cn'
import { PropsWithChildren } from 'react'

export const cardClassNames = twNoop('bg-muted px-4 py-6 rounded-xl')

function CardGroup({ children }: PropsWithChildren) {
  return <div className="flex flex-wrap gap-4">{children}</div>
}

function CardHeading({ children }: PropsWithChildren) {
  return <div className="flex justify-between gap-4">{children}</div>
}

function CardDescription({ children }: PropsWithChildren) {
  return <p className="text-sm text-gray-500 lg:text-base">{children}</p>
}

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('flex min-w-[256px] flex-1 flex-col gap-4', cardClassNames, className)}>
      {children}
    </div>
  )
}

Card.Heading = CardHeading
Card.Description = CardDescription
Card.Group = CardGroup
