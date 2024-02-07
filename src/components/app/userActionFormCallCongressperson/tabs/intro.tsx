'use client'
import { Check } from 'lucide-react'
import React, { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { UseSectionsReturn } from '@/hooks/useSections'

import { SectionNames } from '@/components/app/userActionFormCallCongressperson/constants'

import { UserActionFormLayout } from '@/components/app/userActionFormCommon/layout'

export function Intro({ goToSection }: UseSectionsReturn<SectionNames>) {
  const ref = React.useRef<HTMLButtonElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [ref])
  return (
    <IntroStaticContent>
      <Button ref={ref} onClick={() => goToSection(SectionNames.ADDRESS)}>
        Continue
      </Button>
    </IntroStaticContent>
  )
}

export function IntroStaticContent({ children }: React.PropsWithChildren) {
  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container>
        <UserActionFormLayout.Heading
          title="It's time to fight to keep crypto in America"
          subtitle="Call your Congressperson and tell them to vote YES on the FIT21 bill. Calling your representative is the most effective way to influence legislation."
        />
        <div className="space-y-2">
          <h2 className="text-base font-semibold">Here's what you need to know:</h2>
          <ul>
            <ChecklistItem>
              Congress is voting on a crucial bipartisan bill that could help crypto take a massive
              leap forward
            </ChecklistItem>
            <ChecklistItem>It won't pass without your help</ChecklistItem>
            <ChecklistItem>
              Calling your representative is the most effective action you can take
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
      <Check size={16} />

      <p>{children}</p>
    </li>
  )
}
