import React from 'react'

import { Button } from '@/components/ui/button'
import { useTabsContext } from '@/hooks/useTabs'
import { TabNames } from '@/components/app/userActionFormCallCongressperson/userActionFormCallCongressperson.types'
import { UserActionFormCallCongresspersonTabsContext } from '@/components/app/userActionFormCallCongressperson'

import { UserActionFormCallCongresspersonLayout } from './layout'

export function SuggestedScript() {
  const { gotoTab, tabAdditionalContext } =
    useTabsContext<UserActionFormCallCongresspersonTabsContext>()

  const { user, selectedCongressperson } = tabAdditionalContext ?? {}
  console.log({ user })

  const congresspersonFullName = React.useMemo(() => {
    if (!selectedCongressperson || 'notFoundReason' in selectedCongressperson) {
      return null
    }

    return `${selectedCongressperson.firstName} ${selectedCongressperson.lastName}`
  }, [])

  const handleCallAction = React.useCallback(async () => {
    alert('todo')
    gotoTab(TabNames.SUCCESS_MESSAGE)
  }, [])

  return (
    <>
      <UserActionFormCallCongresspersonLayout>
        <UserActionFormCallCongresspersonLayout.Container>
          <UserActionFormCallCongresspersonLayout.Heading
            title="Call your representative"
            subtitle="You may not get a human on the line, but can leave a message to ensure that your voice will be heard."
          />

          <div className="space-y-2">
            <h2 className="text-base font-semibold">Suggested script</h2>
            <div className="prose rounded-2xl bg-secondary p-5">
              <p>
                Hi, my name is <strong>{user?.fullName ?? '*Your name*'}</strong>
              </p>

              <p>
                I live in{' '}
                {user?.address?.formattedDescription ?? <strong>*where do you live*</strong>} and
                I'm calling to request Representative{' '}
                <strong>{congresspersonFullName ?? '*Congressperson Name*'}</strong>'s support for
                the <strong>Financial Innovation and Technology for the 21st Century Act.</strong>
              </p>

              <p>It's time crypto had regulatory clarity.</p>

              <p>I believe in crypto and the mission to increase economic freedom in the world. </p>

              <p>Thank you and have a nice day!</p>
            </div>
          </div>
        </UserActionFormCallCongresspersonLayout.Container>
      </UserActionFormCallCongresspersonLayout>

      <UserActionFormCallCongresspersonLayout.CongresspersonDisplayFooter
        congressperson={selectedCongressperson}
      >
        {/* TODO: Figure out where is the congressperson's phone number */}
        <Button onClick={handleCallAction}>Call</Button>
      </UserActionFormCallCongresspersonLayout.CongresspersonDisplayFooter>
    </>
  )
}
