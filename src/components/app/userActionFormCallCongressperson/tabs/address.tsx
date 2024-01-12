import { Check } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { useTabsContext } from '@/hooks/useTabs'

import { TabNames } from '@/components/app/userActionFormCallCongressperson/userActionFormCallCongressperson.types'

import { UserActionFormCallCongresspersonLayout } from './layout'

export function Address() {
  const { gotoTab } = useTabsContext()

  return (
    <UserActionFormCallCongresspersonLayout
      title="Find your representative"
      subtitle="Your address will be used to connect you with your representative. Stand With Crypto will never share your data with any third-parties."
      onBack={() => gotoTab(TabNames.INTRO)}
    >
      <UserActionFormCallCongresspersonLayout.Footer>
        <Button onClick={() => gotoTab(TabNames.SUGGESTED_SCRIPT)}>Continue</Button>

        <p className="text-sm">Learn more about our privacy policy</p>
      </UserActionFormCallCongresspersonLayout.Footer>
    </UserActionFormCallCongresspersonLayout>
  )
}
