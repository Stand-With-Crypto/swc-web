import { cn } from '@/utils/web/cn'

interface FormContainerProps {
  children: React.ReactNode
  className?: string
}

export function FormContainer({ children, className }: FormContainerProps) {
  return (
    <div className={cn('space-y-4 px-6 py-8 md:space-y-8 md:px-12', className)}>{children}</div>
  )
}
