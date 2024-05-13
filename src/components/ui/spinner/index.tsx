import { cn } from '@/utils/web/cn'

import styles from './spinner.module.css'

export function Spinner({ className }: { className?: string }) {
  return <span className={cn(styles.base, 'h-6 w-6', className)} />
}
