'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import React from 'react'

export function PageDialog({ children }: React.PropsWithChildren) {
  const router = useRouter()

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  )
}
