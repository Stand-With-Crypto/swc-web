import { cn, twNoop } from '@/utils/web/cn'

export const tabListStyles = twNoop(
  'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
)

export const tabTriggerStyles = twNoop(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
)
