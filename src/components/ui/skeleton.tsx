import { cn } from '@/utils/web/cn'

function Skeleton({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props}>
      {children && <span className="invisible">{children}</span>}
    </div>
  )
}

export { Skeleton }
