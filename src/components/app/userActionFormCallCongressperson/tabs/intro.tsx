import { Check } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { useTabsContext } from '@/hooks/useTabs'

import { TabNames } from '@/components/app/userActionFormCallCongressperson/userActionFormCallCongressperson.types'

import { UserActionFormCallCongresspersonLayout } from './layout'

export function Intro() {
  const { gotoTab } = useTabsContext()

  return (
    <UserActionFormCallCongresspersonLayout
      title="It's time to fight to keep crypto in America"
      subtitle="Call your Congressperson and tell them to vote YES on the FIT21 bill. Calling your representative is the most effective way to influence legislation."
    >
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

      <UserActionFormCallCongresspersonLayout.Footer>
        <Button onClick={() => gotoTab(TabNames.ADDRESS)}>Continue</Button>
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
