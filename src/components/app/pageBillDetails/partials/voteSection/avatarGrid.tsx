import { cn } from '@/utils/web/cn'

interface AvatarGridProps {
  children: React.ReactNode
  className?: string
}

function AvatarGrid({ children, className }: AvatarGridProps) {
  return (
    <div
      className={cn(
        'mb-4 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2 sm:grid-cols-3 md:grid-cols-5 md:gap-y-6 lg:grid-cols-6',
        className,
      )}
    >
      {children}
    </div>
  )
}

export default AvatarGrid
