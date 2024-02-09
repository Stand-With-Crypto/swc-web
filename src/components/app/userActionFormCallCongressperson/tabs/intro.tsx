'use client'
import { Check } from 'lucide-react'
import React, { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { UseSectionsReturn } from '@/hooks/useSections'

import { SectionNames } from '@/components/app/userActionFormCallCongressperson/constants'

import { UserActionFormCallCongresspersonLayout } from './layout'

export function Intro({ goToSection: gotoTab }: UseSectionsReturn<SectionNames>) {
  const ref = React.useRef<HTMLButtonElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [ref])
  return (
    <IntroStaticContent>
      <Button onClick={() => gotoTab(SectionNames.ADDRESS)} ref={ref}>
        Continue
      </Button>
    </IntroStaticContent>
  )
}

export function IntroStaticContent({ children }: React.PropsWithChildren) {
  return (
    <UserActionFormCallCongresspersonLayout>
      <UserActionFormCallCongresspersonLayout.Container>
        <UserActionFormCallCongresspersonLayout.Heading
          subtitle="Call your Congressperson and tell them to vote YES on the FIT21 bill. Calling your representative is the most effective way to influence legislation."
          title="It's time to fight to keep crypto in America"
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
      </UserActionFormCallCongresspersonLayout.Container>
      <UserActionFormCallCongresspersonLayout.Footer>
        {children}
      </UserActionFormCallCongresspersonLayout.Footer>
    </UserActionFormCallCongresspersonLayout>
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
