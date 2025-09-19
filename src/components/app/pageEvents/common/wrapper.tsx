import { cn } from '@/utils/web/cn'

export function EventsPageWrapper({
  children,
  isDeepLink,
}: {
  children: React.ReactNode
  isDeepLink?: boolean
}) {
  return (
    <div
      className={cn(
        'standard-spacing-from-navbar container flex w-full flex-col items-center gap-10 px-6 sm:gap-20 lg:gap-[6.25rem]',
        isDeepLink && 'h-screen',
      )}
    >
      {children}
    </div>
  )
}
