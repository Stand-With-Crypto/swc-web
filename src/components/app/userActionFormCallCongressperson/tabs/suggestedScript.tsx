import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import {
  CreateActionCallCongresspersonInput,
  actionCreateUserActionCallCongressperson,
} from '@/actions/actionCreateUserActionCallCongressperson'
import { UserActionFormCallCongresspersonProps } from '@/components/app/userActionFormCallCongressperson'
import { SectionNames } from '@/components/app/userActionFormCallCongressperson/constants'
import { Button } from '@/components/ui/button'
import { UseSectionsReturn } from '@/hooks/useSections'
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
import { ArrowRight } from 'lucide-react'
import { UserActionFormCallCongresspersonLayout } from './layout'

export function SuggestedScript({
  user,
  congressPersonData: { dtsiPerson, civicData, addressSchema },
  goToSection: gotoTab,
}: Pick<
  UserActionFormCallCongresspersonProps,
  'user' | 'congressPersonData' | keyof UseSectionsReturn<SectionNames>
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
      const data: CreateActionCallCongresspersonInput = {
        campaignName: UserActionCallCampaignName.DEFAULT,
        dtsiSlug: dtsiPerson.slug,
        phoneNumber: phoneNumberToCall,
        address: addressSchema,
      }

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
        gotoTab(SectionNames.SUCCESS_MESSAGE)
      }
    },
    [addressSchema, dtsiPerson.slug, gotoTab, router],
  )

  return (
    <>
      <UserActionFormCallCongresspersonLayout onBack={() => gotoTab(SectionNames.ADDRESS)}>
        <UserActionFormCallCongresspersonLayout.Container>
          <UserActionFormCallCongresspersonLayout.Heading
            title="Call your representative"
            subtitle="You may not get a human on the line, but can leave a message to ensure that your voice will be heard."
          />

          <div className="prose mx-auto">
            <h2 className="mb-2 text-base font-semibold">Suggested script</h2>
            <div className="rounded-2xl bg-secondary p-5">
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
                ref={ref}
                href={`tel:${phoneNumber}`}
                onClick={() => setIsCalling(true)}
                target="_self"
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
