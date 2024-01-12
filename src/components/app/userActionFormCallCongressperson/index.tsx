import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tab, useTabs } from '@/hooks/useTabs'

import { Intro } from './tabs/intro'
import { TabNames } from './userActionFormCallCongressperson.types'

const TABS: Tab[] = [
  {
    id: TabNames.INTRO,
    component: Intro,
  },
  {
    id: TabNames.ADDRESS,
    component: () => <h1>Address Tab</h1>,
  },
  {
    id: TabNames.SUGGESTED_SCRIPT,
    component: () => <h1>Suggested Script Tab</h1>,
  },
  {
    id: TabNames.SUCCESS_MESSAGE,
    component: () => <h1>Success Message Tab</h1>,
  },
]

export function UserActionFormCallCongressperson({
  onCancel,
  onSuccess,
}: {
  onCancel: () => void
  onSuccess: () => void
}) {
  const { component, gotoTab } = useTabs({
    tabs: TABS,
    initialTabId: TabNames.INTRO,
  })

  return (
    <ScrollArea>
      {/* <Button onClick={() => gotoTab(TabNames.INTRO)}>INTRO</Button>
      <Button onClick={() => gotoTab(TabNames.ADDRESS)}>ADDRESS</Button>
      <Button onClick={() => gotoTab(TabNames.SUGGESTED_SCRIPT)}>SUGGESTED_SCRIPT</Button>
      <Button onClick={() => gotoTab(TabNames.SUCCESS_MESSAGE)}>SUCCESS_MESSAGE</Button> */}

      {component}
    </ScrollArea>
  )
}
