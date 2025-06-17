'use client'

import { revalidatePath } from 'next/cache'

import { Button } from '@/components/ui/button'

export function RevalidateButton() {
  return (
    <Button
      onClick={() => {
        revalidatePath('/internal/perf-debug')
      }}
    >
      Revalidate
    </Button>
  )
}
