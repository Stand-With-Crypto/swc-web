'use client'

import { Button } from '@/components/ui/button'

export function TermsOfServiceFooter() {
  return (
    <div className="prose w-full max-w-full">
      <div className="flex items-center justify-between gap-32">
        <div className="max-w-md">
          <p className="prose-lg my-4 font-semibold">
            If you've made it this far, you should really call your Congressperson
          </p>
          <p className="m-0 text-muted-foreground">Don't worry, we'll show you how</p>
        </div>

        <Button onClick={() => alert('TODO')}>GET STARTED</Button>
      </div>
    </div>
  )
}
