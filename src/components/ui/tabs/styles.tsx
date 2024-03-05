import { twNoop } from '@/utils/web/cn'

export const tabListStyles = twNoop(
  'inline-flex items-center justify-center rounded-full bg-muted p-1 text-muted-foreground',
)

export const tabTriggerStyles = twNoop(
  'inline-flex text-fontcolor items-center justify-center whitespace-nowrap rounded-full h-11 text-base px-5 sm:px-8 py-1.5 font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:hover:text-foreground',
)
