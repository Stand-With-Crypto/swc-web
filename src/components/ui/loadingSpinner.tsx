import { Loader2Icon } from 'lucide-react'

import { cn } from '@/utils/web/cn'

interface LoadingSpinnerProps {
  className?: string
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return <Loader2Icon className={cn('h-8 w-8 animate-spin', className)} />
}
