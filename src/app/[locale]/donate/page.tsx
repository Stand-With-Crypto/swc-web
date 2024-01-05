'use client'

import { Button } from '@/components/ui/button'
import { Odometer } from '@/components/ui/odometer/odometer'
import { useState } from 'react'

export const dynamic = 'error'

export default function DonatePage() {
  const [value, setValue] = useState(95832)

  return (
    <div className="container flex flex-col gap-8">
      <Odometer value={value} format="(,ddd).dd" className="text-xl font-bold" />
      <Button onClick={() => setValue(prev => prev + 321)}>ADD</Button>
    </div>
  )
}
