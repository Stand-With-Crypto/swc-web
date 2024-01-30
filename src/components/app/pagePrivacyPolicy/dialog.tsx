import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'
import { lazy } from 'react'

export const LazyPagePrivacyPolicy = lazy(() =>
  import('@/components/app/pagePrivacyPolicy').then(m => ({
    default: m.PagePrivacyPolicy,
  })),
)

export function PrivacyPolicyDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className=" max-w-7xl p-0">
        <div className="flex max-h-dvh w-full flex-col">
          <ScrollArea className="p-4 md:p-10">
            <Suspense fallback={<Skeleton className="h-20 w-full" />}>
              <LazyPagePrivacyPolicy />
            </Suspense>
          </ScrollArea>
          <div
            style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' }}
            className="z-10 flex flex-1 flex-col items-center justify-between gap-4 border border-t p-6 sm:flex-row md:px-12"
          >
            <DialogClose asChild>
              <Button size="lg" className="mx-auto w-full max-w-sm">
                Close
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
