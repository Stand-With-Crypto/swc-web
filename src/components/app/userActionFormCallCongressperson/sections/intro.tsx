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
          subtitle="Call your Rep and ask them to support crypto"
          title="We Need To Keep Up Crypto's Momentum"
        />
        <div className="space-y-2">
          <h2 className="text-base font-semibold">Here's what you need to know:</h2>
          <ul>
            <ChecklistItem>
              The U.S. House has passed FIT21, a critical bipartisan pro-crypto bill that protects
              consumers
            </ChecklistItem>
            <ChecklistItem>
              We want to thank members who voted yes, and encourage all members to keep crypto in
              their priorities
            </ChecklistItem>
            <ChecklistItem>
              Calling your member of Congress is the most direct and effective way to raise
              awareness
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
