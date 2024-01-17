import React from 'react'
import * as Sentry from '@sentry/nextjs'
import _ from 'lodash'

import { Button } from '@/components/ui/button'
import { useTabsContext } from '@/hooks/useTabs'
import { TabNames } from '@/components/app/userActionFormCallCongressperson/userActionFormCallCongressperson.types'
import { UserActionFormCallCongresspersonProps } from '@/components/app/userActionFormCallCongressperson'

import { UserActionFormCallCongresspersonLayout } from './layout'
import { getGoogleCivicOfficialByDTSIName } from '@/utils/shared/googleCivicInfo'
import { InternalLink } from '@/components/ui/link'
import { actionCreateUserActionCallCongressperson } from '@/actions/actionCreateUserActionCallCongressperson'
import { UserActionCallCampaignName } from '@/utils/shared/userActionCampaigns'
import { createActionCallCongresspersonInputValidationSchema } from '@/actions/actionCreateUserActionCallCongressperson/inputValidationSchema'

export function SuggestedScript({
  user,
  congressPersonData: { dtsiPerson, civicData },
}: Pick<UserActionFormCallCongresspersonProps, 'user' | 'congressPersonData'>) {
  const { gotoTab } = useTabsContext<TabNames>()

  const congresspersonFullName = React.useMemo(() => {
    return `${dtsiPerson.firstName} ${dtsiPerson.lastName}`
  }, [])

  const parsedAddress = React.useMemo(() => {
    const { normalizedInput } = civicData

    return `${normalizedInput.city}, ${normalizedInput.state}`
  }, [])

  const phoneNumber = React.useMemo(() => {
    const official = getGoogleCivicOfficialByDTSIName(
      {
        firstName: dtsiPerson.firstName,
        lastName: dtsiPerson.lastName,
      },
      civicData,
    )

    if (!official) {
      return null
    }

    return _.get(official, 'phones[0]')
  }, [])

  const handleCallAction = React.useCallback(async () => {
    const input = {
      campaignName: UserActionCallCampaignName.DEFAULT,
      dtsiSlug: dtsiPerson.slug,
      phoneNumber,
    }
    const validatedInput = createActionCallCongresspersonInputValidationSchema.safeParse(input)

    if (!validatedInput.success) {
      Sentry.captureMessage('Call Action - Invalid input', {
        user: { id: user?.id },
        extra: {
          input,
          validationResult: validatedInput.error,
        },
      })
      return
    }

    await actionCreateUserActionCallCongressperson(validatedInput.data).catch(e => {
      Sentry.captureException(e, {
        user: { id: user?.id },
        extra: {
          input,
        },
      })
    })

    gotoTab(TabNames.SUCCESS_MESSAGE)
  }, [phoneNumber, user, dtsiPerson])

  return (
    <>
      <UserActionFormCallCongresspersonLayout onBack={() => gotoTab(TabNames.ADDRESS)}>
        <UserActionFormCallCongresspersonLayout.Container>
          <UserActionFormCallCongresspersonLayout.Heading
            title="Call your representative"
            subtitle="You may not get a human on the line, but can leave a message to ensure that your voice will be heard."
          />

          <div className="space-y-2">
            <h2 className="text-base font-semibold">Suggested script</h2>
            <div className="prose rounded-2xl bg-secondary p-5">
              <p>
                Hi, my name is <strong>{user?.fullName ?? '____'}</strong>
              </p>

              <p>
                I live in {parsedAddress} and I'm calling to request Representative{' '}
                <strong>{congresspersonFullName}</strong>'s support for the{' '}
                <strong>Financial Innovation and Technology for the 21st Century Act.</strong>
              </p>

              <p>It's time crypto had regulatory clarity.</p>

              <p>I believe in crypto and the mission to increase economic freedom in the world. </p>

              <p>Thank you and have a nice day!</p>
            </div>
          </div>
        </UserActionFormCallCongresspersonLayout.Container>
      </UserActionFormCallCongresspersonLayout>

      <UserActionFormCallCongresspersonLayout.CongresspersonDisplayFooter
        congressperson={dtsiPerson}
      >
        {phoneNumber && (
          <Button asChild>
            <InternalLink href={`tel:${phoneNumber}`} onClick={handleCallAction}>
              Call
            </InternalLink>
          </Button>
        )}
      </UserActionFormCallCongresspersonLayout.CongresspersonDisplayFooter>
    </>
  )
}
