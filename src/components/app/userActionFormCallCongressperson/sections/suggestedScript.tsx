import React, { useEffect, useState } from 'react'
import { UserActionType } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

import {
  actionCreateUserActionCallCongressperson,
  CreateActionCallCongresspersonInput,
} from '@/actions/actionCreateUserActionCallCongressperson'
import { BillVoteResult } from '@/app/api/public/dtsi/bill-vote/[billId]/[slug]/route'
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
import { useCongresspersonBillVote } from '@/hooks/useCongresspersonBillVote'
import { useIsMobile } from '@/hooks/useIsMobile'
import { UseSectionsReturn } from '@/hooks/useSections'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { BILLS_IDS } from '@/utils/shared/constants'
import { formatPhoneNumber } from '@/utils/shared/phoneNumber'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { USUserActionCallCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { userFullName } from '@/utils/shared/userFullName'
import { getYourPoliticianCategoryShortDisplayName } from '@/utils/shared/yourPoliticianCategory/us'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { toastGenericError } from '@/utils/web/toastUtils'
import { zodAddress } from '@/validation/fields/zodAddress'

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
  const { dtsiPeople, addressSchema } = congressPersonData

  const isMobile = useIsMobile()
  const responsiveContent = RESPONSIVE_CONTENT[isMobile ? 'mobile' : 'desktop']

  const router = useRouter()

  const dtsiPerson = dtsiPeople[0]
  const phoneNumber = React.useMemo(() => {
    // TODO: get the official phone number information once we have it from quorum
    toastGenericError()
    return null
  }, [])

  const { data: congresspersonBillVote } = useCongresspersonBillVote({
    slug: dtsiPerson.slug,
    billId: BILLS_IDS.FIT21,
  })

  const [callingState, setCallingState] = useState<
    'not-calling' | 'pressed-called' | 'loading-call-complete' | 'call-complete' | 'error'
  >('not-calling')

  const handleCallAction = React.useCallback(
    async (phoneNumberToCall: string) => {
      const data: CreateActionCallCongresspersonInput = {
        campaignName: USUserActionCallCampaignName.FIT21_2024_04,
        dtsiSlug: dtsiPerson.slug,
        phoneNumber: phoneNumberToCall,
        address: addressSchema,
      }
      setCallingState('loading-call-complete')

      const result = await triggerServerActionForForm(
        {
          formName: 'User Action Form Call Congressperson',
          analyticsProps: {
            ...convertAddressToAnalyticsProperties(data.address),
            'Campaign Name': data.campaignName,
            'User Action Type': UserActionType.CALL,
            'DTSI Slug': data.dtsiSlug,
          },
          payload: data,
          onError: toastGenericError,
        },
        payload =>
          actionCreateUserActionCallCongressperson(payload).then(async actionResultPromise => {
            const actionResult = await actionResultPromise
            if (actionResult && 'user' in actionResult && actionResult.user) {
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

              {getSuggestedScriptCopy({
                billVote: congresspersonBillVote || 'NO_VOTE',
                dtsiPerson,
                address: addressSchema,
              })}

              <p>Thank you so much and have a nice day!</p>
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

const getSuggestedScriptCopy = ({
  billVote,
  dtsiPerson,
  address,
}: {
  billVote: BillVoteResult
  dtsiPerson: Parameters<typeof dtsiPersonFullName>[0]
  address: z.infer<typeof zodAddress>
}) => {
  const repFullName = dtsiPersonFullName(dtsiPerson)

  if (billVote === 'VOTED_FOR') {
    return (
      <>
        <p>
          I live in {address.locality}, {address.administrativeAreaLevel1} and I'm calling to thank{' '}
          <strong>{repFullName}</strong>
          for their recent vote on the bipartisan{' '}
          <strong>Financial Innovation and Technology for the 21st Century Act</strong>.
        </p>

        <p>
          I am a crypto owner and I care about Congress passing legislation to protect consumers and
          strengthen America's role as a global crypto leader.
        </p>

        <p>
          I'm glad that FIT21 passed the house, and I'm grateful for <strong>{repFullName}</strong>
          's vote in favor. I hope they will encourage their colleagues in the Senate to take up the
          bill as well.
        </p>
      </>
    )
  }

  return (
    <>
      <p>
        I live in {address.locality}, {address.administrativeAreaLevel1}, and I'm calling to tell{' '}
        <strong>{repFullName}</strong> that I am their constituent and I care about crypto and
        blockchain technology.
      </p>

      <p>
        I am a crypto owner and I believe Congress should pass legislation to protect consumers and
        strengthen America's role as a global crypto leader.
      </p>

      <p>
        I'm glad that the bipartisan{' '}
        <strong>Financial Innovation and Technology for the 21st Century Act</strong>
        recently passed the house with a large majority. I hope that <strong>
          {repFullName}
        </strong>{' '}
        will keep my views and the views of other local crypto owners in mind on future votes.
      </p>
    </>
  )
}
