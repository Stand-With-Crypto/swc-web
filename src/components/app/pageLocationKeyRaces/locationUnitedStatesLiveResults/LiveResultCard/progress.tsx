import { cn } from '@/utils/web/cn'

interface ProgressProps {
  percentage: number | undefined
  className?: string
}

export function Progress(props: ProgressProps) {
  const { percentage, className } = props

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-black text-center transition-all',
        className,
      )}
      style={{
        width: Math.min(+(percentage || 0).toFixed(2), 100) + '%',
      }}
    />
  )
}
