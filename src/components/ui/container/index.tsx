import { cn } from '@/utils/web/cn'

export function Container(props: { children: React.ReactNode }) {
  return (
    <div {...props} className={cn('container')}>
      {props.children}
    </div>
  )
}
