import React, { useEffect, useState } from 'react'
import { UserActionType } from '@prisma/client'
import { useRouter } from 'next/navigation'

import {
  actionCreateUserActionCallCongressperson,
  CreateActionCallCongresspersonInput,
} from '@/actions/actionCreateUserActionCallCongressperson'
import { CallCongresspersonActionSharedData } from '@/components/app/userActionFormCallCongressperson'
import {
  CALL_FLOW_POLITICIANS_CATEGORY,
  SectionNames,
} from '@/components/app/userActionFormCallCongressperson/constants'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon/layout'
import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import { TrackedExternalLink } from '@/components/ui/trackedExternalLink'
import { useIsMobile } from '@/hooks/useIsMobile'
import { UseSectionsReturn } from '@/hooks/useSections'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { getGoogleCivicOfficialByDTSIName } from '@/utils/shared/googleCivicInfo'
import { formatPhoneNumber } from '@/utils/shared/phoneNumber'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { UserActionCallCampaignName } from '@/utils/shared/userActionCampaigns'
import { userFullName } from '@/utils/shared/userFullName'
import { getYourPoliticianCategoryShortDisplayName } from '@/utils/shared/yourPoliticianCategory'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { toastGenericError } from '@/utils/web/toastUtils'

type CallingState =
  | 'not-calling'
  | 'pressed-called'
  | 'loading-call-complete'
  | 'call-complete'
  | 'error'

interface DynamicContent {
  Subtitle: React.FC<{ address: string; onClick: () => void }>
  PhoneNumberDisplay: React.FC<{ phoneNumber: string | null }>
  CTA: React.FC<{
    onCallComplete: () => Promise<void>
    phoneNumber: string
    disabled?: boolean
    callingState: CallingState
    onCallingStateChange: (newState: CallingState) => void
  }>
}

const RESPONSIVE_CONTENT: Record<'mobile' | 'desktop', DynamicContent> = {
  mobile: {
    Subtitle: ({ address, onClick }) => (
      <>
        Showing the representative for your address in{' '}
        <ExternalLink className="cursor-pointer" onClick={onClick}>
          {address}
        </ExternalLink>
        .
      </>
    ),
    PhoneNumberDisplay: () => null,
    CTA: ({ onCallComplete, callingState, onCallingStateChange, phoneNumber, disabled }) => {
      const ref = React.useRef<HTMLAnchorElement>(null)
      useEffect(() => {
        ref.current?.focus({ preventScroll: true })
      }, [ref])

      if (callingState !== 'not-calling') {
        return (
          <Button disabled={disabled} onClick={onCallComplete}>
            Call complete
          </Button>
        )
      }

      return (
        <Button asChild>
          <TrackedExternalLink
            href={`tel:${phoneNumber}`}
            onClick={() => onCallingStateChange('pressed-called')}
            ref={ref}
            target="_self"
          >
            Call
          </TrackedExternalLink>
        </Button>
      )
    },
  },
  desktop: {
    Subtitle: ({ address, onClick }) => (
      <>
        Showing the representative for your address in{' '}
        <ExternalLink className="cursor-pointer" onClick={onClick}>
          {address}
        </ExternalLink>
        .<br />
        Call the number below and then click “Call complete” when finished.
      </>
    ),
    PhoneNumberDisplay: ({ phoneNumber }) => {
      if (!phoneNumber) {
        return null
      }

      return (
        <PageTitle as="p" className="mb-2 text-4xl text-primary-cta md:text-4xl lg:text-4xl">
          {formatPhoneNumber(phoneNumber)}
        </PageTitle>
      )
    },
    CTA: ({ onCallComplete, disabled }) => (
      <Button disabled={disabled} onClick={onCallComplete}>
        Call complete
      </Button>
    ),
  },
}

export function SuggestedScript({
  user,
  congressPersonData,
  goToSection,
  goBackSection,
}: Pick<
  CallCongresspersonActionSharedData,
  'user' | 'congressPersonData' | keyof UseSectionsReturn<SectionNames>
>) {
  const { dtsiPeople, addressSchema, googleCivicData } = congressPersonData

  const isMobile = useIsMobile()
  const responsiveContent = RESPONSIVE_CONTENT[isMobile ? 'mobile' : 'desktop']

  const router = useRouter()

  const dtsiPerson = dtsiPeople[0]
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
        campaignName: UserActionCallCampaignName.SUMMER_2024_SENATE_BILL_CAMPAIGN,
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
    <div className="flex h-full max-h-full flex-col">
      <UserActionFormLayout className="mb-4 overflow-y-auto rounded-2xl" onBack={goBackSection}>
        <UserActionFormLayout.Container>
          <UserActionFormLayout.Heading
            subtitle={
              <responsiveContent.Subtitle
                address={addressSchema.locality}
                onClick={() => goToSection(SectionNames.CHANGE_ADDRESS)}
              />
            }
            title={`Call your ${getYourPoliticianCategoryShortDisplayName(CALL_FLOW_POLITICIANS_CATEGORY, { maxCount: 1 })}`}
          />

          <responsiveContent.PhoneNumberDisplay phoneNumber={phoneNumber} />

          <div className="prose mx-auto">
            <h2 className="mb-2 text-base font-semibold">Suggested script</h2>
            <div className="rounded-2xl bg-secondary p-5">
              <p>
                Hi, my name is <strong>{userFullName(user ?? {}, { fallback: '____' })}</strong>
              </p>

              <p>
                I live in {addressSchema.locality}, {addressSchema.administrativeAreaLevel1} and I'm
                calling to request <strong>{dtsiPersonFullName(dtsiPerson)}</strong> votes Yes on
                the <strong>FIT21 Act</strong> that will protect consumers, create jobs, foster
                innovation, and safeguard our national security.
              </p>

              <p>
                It's time crypto had a clear regulatory framework to protect consumers for the road
                ahead.
              </p>

              <p>Thank you and have a nice day!</p>
            </div>
          </div>
        </UserActionFormLayout.Container>
      </UserActionFormLayout>

      <UserActionFormLayout.CongresspersonDisplayFooter
        dtsiPeopleResponse={congressPersonData}
        maxPeopleDisplayed={1}
      >
        {phoneNumber ? (
          <responsiveContent.CTA
            callingState={callingState}
            disabled={callingState === 'loading-call-complete'}
            onCallComplete={() => handleCallAction(phoneNumber)}
            onCallingStateChange={setCallingState}
            phoneNumber={phoneNumber}
          />
        ) : null}
      </UserActionFormLayout.CongresspersonDisplayFooter>
    </div>
  )
}
