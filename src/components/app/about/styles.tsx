import { cn, twNoop } from '@/utils/web/cn'

export const cardClassNames = twNoop('bg-muted px-4 py-6 rounded-xl')
export const sectionClassNames = twNoop('mb-16 space-y-7 md:mb-24')
export const americaNeedsCryptoCardClassNames = cn(
  'space-y-4 text-gray-500 text-start',
  cardClassNames,
)
export const americaNeedsCryptoCardTitleClassNames = twNoop('text-start text-foreground')
export const americaNeedsCryptoCardListClassNames = twNoop('list-disc mt-4 ml-4')
