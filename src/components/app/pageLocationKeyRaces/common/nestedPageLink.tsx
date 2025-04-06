import { InternalLink, InternalLinkProps } from '@/components/ui/link'
import { cn } from '@/utils/web/cn'

export function NestedPageLink({ className, ...props }: InternalLinkProps) {
  return (
    <InternalLink className={cn('mb-4 block flex-shrink-0 font-semibold', className)} {...props} />
  )
}
