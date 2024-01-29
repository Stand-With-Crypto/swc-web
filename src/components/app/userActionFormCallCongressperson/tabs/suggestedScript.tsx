import React, { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import _ from 'lodash'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { TabNames } from '@/components/app/userActionFormCallCongressperson/userActionFormCallCongressperson.types'
import { UserActionFormCallCongresspersonProps } from '@/components/app/userActionFormCallCongressperson'
import { getGoogleCivicOfficialByDTSIName } from '@/utils/shared/googleCivicInfo'
import { InternalLink } from '@/components/ui/link'
import { actionCreateUserActionCallCongressperson } from '@/actions/actionCreateUserActionCallCongressperson'
import { UserActionCallCampaignName } from '@/utils/shared/userActionCampaigns'
import { createActionCallCongresspersonInputValidationSchema } from '@/actions/actionCreateUserActionCallCongressperson/inputValidationSchema'
import { toastGenericError } from '@/utils/web/toastUtils'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { UserActionType } from '@prisma/client'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { UseTabsReturn } from '@/hooks/useTabs'

import { UserActionFormCallCongresspersonLayout } from './layout'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { userFullName } from '@/utils/shared/userFullName'

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
        {phoneNumber && (
          <Button asChild>
            <InternalLink
              ref={ref}
              href={`tel:${phoneNumber}`}
              onClick={() => handleCallAction(phoneNumber)}
            >
              Call
            </InternalLink>
          </Button>
        )}
      </UserActionFormCallCongresspersonLayout.CongresspersonDisplayFooter>
    </>
  )
}
