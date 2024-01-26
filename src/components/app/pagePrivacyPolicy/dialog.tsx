import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
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
      <DialogContent className="w-full max-w-7xl md:p-10">
        <Suspense fallback={<Skeleton className="h-20 w-full" />}>
          <LazyPagePrivacyPolicy />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
