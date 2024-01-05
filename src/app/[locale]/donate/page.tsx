'use client'

import { Button } from '@/components/ui/button'
import { Odometer } from '@/components/ui/odometer/odometer'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useState } from 'react'

export const dynamic = 'error'

export default function DonatePage() {
  const [value, setValue] = useState(95832)

  return (
    <div className="container flex flex-col gap-8">
      <PageTitle>
        <Odometer value={value} format="(,ddd).dd" />
      </PageTitle>
      <Button onClick={() => setValue(prev => prev + 321)}>ADD</Button>
    </div>
  )
}
