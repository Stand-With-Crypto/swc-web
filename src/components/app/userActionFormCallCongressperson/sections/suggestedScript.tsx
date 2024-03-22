import React, { useEffect, useState } from 'react'
import { UserActionType } from '@prisma/client'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

import {
  actionCreateUserActionCallCongressperson,
  CreateActionCallCongresspersonInput,
} from '@/actions/actionCreateUserActionCallCongressperson'
import { UserActionFormCallCongresspersonProps } from '@/components/app/userActionFormCallCongressperson'
import { SectionNames } from '@/components/app/userActionFormCallCongressperson/constants'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon/layout'
import { Button } from '@/components/ui/button'
import { TrackedExternalLink } from '@/components/ui/trackedExternalLink'
import { UseSectionsReturn } from '@/hooks/useSections'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { getGoogleCivicOfficialByDTSIName } from '@/utils/shared/googleCivicInfo'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { UserActionCallCampaignName } from '@/utils/shared/userActionCampaigns'
import { userFullName } from '@/utils/shared/userFullName'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { toastGenericError } from '@/utils/web/toastUtils'

export function SuggestedScript({
  user,
  congressPersonData,
  goToSection,
}: Pick<
  UserActionFormCallCongresspersonProps,
  'user' | 'congressPersonData' | keyof UseSectionsReturn<SectionNames>
>) {
  const { dtsiPerson, addressSchema, googleCivicData } = congressPersonData

  const router = useRouter()
  const ref = React.useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [ref])
  const phoneNumber = React.useMemo(() => {
    const official = getGoogleCivicOfficialByDTSIName(dtsiPerson, googleCivicData)

    if (!official) {
      toastGenericError()
      return null
    }

    return official.phones[0]
  }, [dtsiPerson, googleCivicData])

  const [callingState, setCallingState] = useState<
    'not-calling' | 'pressed-called' | 'loading-call-complete' | 'call-complete' | 'error'
  >('not-calling')

  const handleCallAction = React.useCallback(
    async (phoneNumberToCall: string) => {
      const data: CreateActionCallCongresspersonInput = {
        campaignName: UserActionCallCampaignName.DEFAULT,
        dtsiSlug: dtsiPerson.slug,
        phoneNumber: phoneNumberToCall,
        address: addressSchema,
      }
      setCallingState('loading-call-complete')

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
          payload: data,
        },
        payload =>
          actionCreateUserActionCallCongressperson(payload).then(actionResult => {
            if (actionResult?.user) {
              identifyUserOnClient(actionResult.user)
            }
            return actionResult
          }),
      )

      if (result.status === 'success') {
        setCallingState('call-complete')
        router.refresh()
        goToSection(SectionNames.SUCCESS_MESSAGE)
      } else {
        setCallingState('error')
        toastGenericError()
      }
    },
    [addressSchema, dtsiPerson.slug, goToSection, router],
  )

  return (
    <>
      <UserActionFormLayout onBack={() => goToSection(SectionNames.ADDRESS)}>
        <UserActionFormLayout.Container>
          <UserActionFormLayout.Heading
            subtitle="You may not get a human on the line, but can leave a message to ensure that your voice will be heard."
            title="Call your representative"
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
        </UserActionFormLayout.Container>
      </UserActionFormLayout>

      <UserActionFormLayout.CongresspersonDisplayFooter dtsiPerson={congressPersonData}>
        {phoneNumber ? (
          callingState !== 'not-calling' ? (
            <Button
              disabled={callingState === 'loading-call-complete'}
              onClick={() => handleCallAction(phoneNumber)}
            >
              <span className="mr-1 inline-block">Call complete</span>{' '}
              <ArrowRight className="h-5 w-5" />
            </Button>
          ) : (
            <Button asChild>
              <TrackedExternalLink
                href={`tel:${phoneNumber}`}
                onClick={() => setCallingState('pressed-called')}
                ref={ref}
                target="_self"
              >
                Call
              </TrackedExternalLink>
            </Button>
          )
        ) : null}
      </UserActionFormLayout.CongresspersonDisplayFooter>
    </>
  )
}
