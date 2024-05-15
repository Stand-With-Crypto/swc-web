'use client'
import React from 'react'
import { Check } from 'lucide-react'

import { UserActionFormLayout } from '@/components/app/userActionFormCommon/layout'
import { Button } from '@/components/ui/button'

interface IntroProps {
  onContinue: () => void
  loading?: boolean
}

export function Intro({ onContinue, loading }: IntroProps) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [ref])
  return (
    <IntroStaticContent>
      <Button disabled={loading} onClick={onContinue} ref={ref}>
        {loading ? 'Loading...' : 'Continue'}
      </Button>
    </IntroStaticContent>
  )
}

export function IntroStaticContent({ children }: React.PropsWithChildren) {
  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container>
        <UserActionFormLayout.Heading
          subtitle={`Call your Rep and ask them to vote YES on the FIT21 bill.`}
          title="It's time to fight to keep crypto in America"
        />
        <div className="space-y-2">
          <h2 className="text-base font-semibold">Here's what you need to know:</h2>
          <ul>
            <ChecklistItem>
              Congress is voting on a crucial bipartisan bill that will help protect consumers
            </ChecklistItem>
            <ChecklistItem>It won't pass without your help</ChecklistItem>
            <ChecklistItem>
              Calling your member of congress is the most effective action you can take
            </ChecklistItem>
          </ul>
        </div>
      </UserActionFormLayout.Container>
      <UserActionFormLayout.Footer>{children}</UserActionFormLayout.Footer>
    </UserActionFormLayout>
  )
}

function ChecklistItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-4 py-2">
      <div className="min-w-4">
        <Check size={16} />
      </div>

      <p>{children}</p>
    </li>
  )
}
