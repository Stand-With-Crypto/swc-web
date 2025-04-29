'use client'

import React from 'react'
import { Check } from 'lucide-react'

import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { Button } from '@/components/ui/button'

export function FollowLinkedIn({ children }: React.PropsWithChildren) {
  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container className="h-auto items-center justify-between">
        {children}
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}

function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  return <UserActionFormLayout.Heading subtitle={subtitle} title={title} />
}
FollowLinkedIn.Heading = Heading

function Benefits({ benefits }: { benefits: string[] }) {
  return (
    <div>
      <p className="mb-4">By following Stand With Crypto, you are:</p>

      <ul className="space-y-2">
        {benefits.map((info: string) => (
          <li className="flex items-center gap-4" key={info}>
            <Check size={20} />
            <span>{info}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
FollowLinkedIn.Benefits = Benefits

function SubmitButton({
  text,
  onClick,
  className,
}: {
  text: string
  onClick: () => void
  className?: string
}) {
  return (
    <Button className={`w-full max-w-[450px] ${className || ''}`} onClick={onClick} size="lg">
      {text}
    </Button>
  )
}
FollowLinkedIn.SubmitButton = SubmitButton
