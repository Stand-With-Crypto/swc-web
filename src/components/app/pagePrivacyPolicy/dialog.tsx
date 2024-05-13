import { lazy, Suspense } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

export const LazyPagePrivacyPolicy = lazy(() =>
  import('@/components/app/pagePrivacyPolicy').then(m => ({
    default: m.PagePrivacyPolicy,
  })),
)

export function PrivacyPolicyDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog analytics={'Privacy Policy'}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-7xl" padding={false}>
        <div className="flex max-h-dvh w-full flex-col">
          <ScrollArea>
            <div className={dialogContentPaddingStyles}>
              <Suspense fallback={<Skeleton className="h-20 w-full" />}>
                <LazyPagePrivacyPolicy />
              </Suspense>
            </div>
          </ScrollArea>
          <div
            className="z-10 flex flex-1 flex-col items-center justify-between gap-4 border border-t p-6 sm:flex-row md:px-12"
            style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' }}
          >
            <DialogClose asChild>
              <Button className="mx-auto w-full max-w-sm" size="lg">
                Close
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
