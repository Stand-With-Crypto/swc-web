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
      <div className="flex w-auto flex-col flex-wrap gap-6 px-2 sm:inline-flex sm:flex-row md:px-4">
        {children}
      </div>
    </section>
  )
}
