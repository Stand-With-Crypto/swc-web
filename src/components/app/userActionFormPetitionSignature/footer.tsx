import { cn } from '@/utils/web/cn'

import { DEFAULT_INNER_WIDTH_CLASS_NAME } from './constants'

interface FooterProps {
  children: React.ReactNode
  className?: string
}

export function Footer({ children, className }: FooterProps) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 flex flex-col items-center justify-center gap-4 border-t bg-background px-6 py-8 pt-4 md:pt-6',
        className,
      )}
      style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' }}
    >
      <div className={cn(DEFAULT_INNER_WIDTH_CLASS_NAME, 'space-y-4')}>{children}</div>
    </div>
  )
}
