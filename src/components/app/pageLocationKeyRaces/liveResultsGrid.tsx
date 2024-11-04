import { cn } from '@/utils/web/cn'

export function LiveResultsGrid({
  children,
  className,
}: React.PropsWithChildren<{
  className?: string
}>) {
  return (
    <section
      className={cn(
        'grid grid-cols-1 divide-x-2 divide-y-2 border-b-2 border-t-2 lg:grid-cols-2',
        className,
      )}
    >
      {children}
    </section>
  )
}

function GridItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-center px-6 py-10 last:!border-r-2 md:px-12 md:py-14 lg:px-20 lg:odd:justify-end lg:even:justify-start lg:[&:nth-child(-n+2)]:!border-t-0',
        className,
      )}
    >
      {children}
    </div>
  )
}

LiveResultsGrid.GridItem = GridItem
