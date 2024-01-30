import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { z } from 'zod'

import { actionCreateUserActionCallCongressperson } from '@/actions/actionCreateUserActionCallCongressperson'
import { createActionCallCongresspersonInputValidationSchema } from '@/actions/actionCreateUserActionCallCongressperson/inputValidationSchema'
import { UserActionFormCallCongresspersonProps } from '@/components/app/userActionFormCallCongressperson'
import { TabNames } from '@/components/app/userActionFormCallCongressperson/userActionFormCallCongressperson.types'
import { Button } from '@/components/ui/button'
import { UseTabsReturn } from '@/hooks/useTabs'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { getGoogleCivicOfficialByDTSIName } from '@/utils/shared/googleCivicInfo'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { UserActionCallCampaignName } from '@/utils/shared/userActionCampaigns'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { toastGenericError } from '@/utils/web/toastUtils'
import { UserActionType } from '@prisma/client'

import { TrackedExternalLink } from '@/components/ui/trackedExternalLink'
import { userFullName } from '@/utils/shared/userFullName'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { UserActionFormCallCongresspersonLayout } from './layout'
import { ArrowRight } from 'lucide-react'

export function SuggestedScript({
  user,
  congressPersonData: { dtsiPerson, civicData, addressSchema },
  gotoTab,
}: Pick<
  UserActionFormCallCongresspersonProps,
  'user' | 'congressPersonData' | keyof UseTabsReturn<TabNames>
>) {
  const router = useRouter()
  const ref = React.useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [ref])
  const phoneNumber = React.useMemo(() => {
    const official = getGoogleCivicOfficialByDTSIName(
      {
        firstName: dtsiPerson.firstName,
        lastName: dtsiPerson.lastName,
      },
      civicData,
    )

    if (!official) {
      toastGenericError()
      return null
    }

    return official.phones[0]
  }, [dtsiPerson, civicData])

  const [isCalling, setIsCalling] = useState(false)

  const handleCallAction = React.useCallback(
    async (phoneNumberToCall: string) => {
      const input: z.infer<typeof createActionCallCongresspersonInputValidationSchema> = {
        campaignName: UserActionCallCampaignName.DEFAULT,
        dtsiSlug: dtsiPerson.slug,
        phoneNumber: phoneNumberToCall,
        address: addressSchema,
      }
      const validatedInput = createActionCallCongresspersonInputValidationSchema.safeParse(input)

      if (!validatedInput.success) {
        toastGenericError()
        Sentry.captureMessage('Call Action - Invalid input', {
          user: { id: user?.id },
          extra: {
            input,
            validationResult: validatedInput.error,
          },
        })
        return
      }

      const { data } = validatedInput
      const result = await triggerServerActionForForm(
        {
          formName: 'User Action Form Call Congressperson',
          onError: toastGenericError,
          analyticsProps: {
            ...convertAddressToAnalyticsProperties(data.address),
            'Campaign Name': data.campaignName,
            'User Action Type': UserActionType.CALL,
            'DTSI Slug': data.dtsiSlug,
          },
        },
        () =>
          actionCreateUserActionCallCongressperson(data).then(actionResult => {
            if (actionResult.user) {
              identifyUserOnClient(actionResult.user)
            }
            return actionResult
          }),
      )

      if (result.status === 'success') {
        router.refresh()
        gotoTab(TabNames.SUCCESS_MESSAGE)
      }
    },
    [addressSchema, dtsiPerson.slug, gotoTab, router, user?.id],
  )

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
                Hi, my name is <strong>{userFullName(user ?? {}, { fallback: '____' })}</strong>
              </p>

              <p>
                I live in {addressSchema.locality}, {addressSchema.administrativeAreaLevel1} and I'm
                calling to request Representative <strong>{dtsiPersonFullName(dtsiPerson)}</strong>
                's support for the{' '}
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
        {phoneNumber ? (
          isCalling ? (
            <Button onClick={() => handleCallAction(phoneNumber)}>
              <span className="mr-1 inline-block">Call complete</span>{' '}
              <ArrowRight className="h-5 w-5" />
            </Button>
          ) : (
            <Button asChild>
              <TrackedExternalLink
                target="_self"
                ref={ref}
                href={`tel:${phoneNumber}`}
                onClick={() => setIsCalling(true)}
              >
                Call
              </TrackedExternalLink>
            </Button>
          )
        ) : null}
      </UserActionFormCallCongresspersonLayout.CongresspersonDisplayFooter>
    </>
  )
}
