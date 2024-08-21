'use client'

import React from 'react'
import { UserActionType } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/navigation'

import {
  actionCreateUserActionVoterAttestation,
  CreateActionVoterAttestationInput,
} from '@/actions/actionCreateUserActionVoterAttestation'
import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { AuthenticateWithoutProfileUpdate } from '@/components/app/authentication/authenticateAndUpdateProfile'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_VOTER_ATTESTATION,
  SectionNames,
} from '@/components/app/userActionFormVoterAttestation/constants'
import { PledgeSection } from '@/components/app/userActionFormVoterAttestation/sections/pledge'
import { UserActionFormCallCongresspersonSuccess } from '@/components/app/userActionFormVoterAttestation/sections/success'
import { FormFields } from '@/components/app/userActionFormVoterAttestation/types'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useGoogleMapsScript } from '@/hooks/useGoogleMapsScript'
import { useSections, UseSectionsReturn } from '@/hooks/useSections'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { UserActionVoterAttestationCampaignName } from '@/utils/shared/userActionCampaigns'
import { USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import {
  convertGooglePlaceAutoPredictionToAddressSchema,
  GooglePlaceAutocompletePrediction,
} from '@/utils/web/googlePlaceUtils'
import { toastGenericError } from '@/utils/web/toastUtils'

import { Address, AddressProps } from './sections/address'
import { Intro } from './sections/intro'
import { useRacesByAddress } from './useRacesByAddress'

export interface VoterAttestationActionSharedData extends UseSectionsReturn<SectionNames> {
  user: GetUserFullProfileInfoResponse['user']
  userState: USStateCode
  onFindAddress: (address: GooglePlaceAutocompletePrediction | null) => void
}

interface UserActionFormVoterAttestationProps {
  user: GetUserFullProfileInfoResponse['user']
  onClose: () => void
  initialValues?: FormFields
}

export function UserActionFormVoterAttestation({
  user,
  onClose,
  initialValues,
}: UserActionFormVoterAttestationProps) {
  useGoogleMapsScript()
  const router = useRouter()
  const [address, setAddress] = React.useState<GooglePlaceAutocompletePrediction | null>(
    user?.address
      ? { description: user.address.formattedDescription, place_id: user.address.googlePlaceId }
      : (initialValues?.address ?? null),
  )
  const [isCreatingAction, setIsCreatingAction] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>()

  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.INTRO,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_VOTER_ATTESTATION,
  })

  const { mutate } = useApiResponseForUserFullProfileInfo()

  const racesByAddressRequest = useRacesByAddress(address?.description)
  const isRacesByAddressRequestActive = React.useRef(!!address?.description)
  isRacesByAddressRequestActive.current = !!address?.description

  const addressProps: AddressProps = {
    initialValues: address
      ? {
          address,
        }
      : undefined,
    user,
    onFindAddress: setAddress,
    error: errorMessage,
    ...sectionProps,
    goBackSection: () => sectionProps.goToSection(SectionNames.INTRO),
    isLoading: racesByAddressRequest.isLoading,
  }

  const sectionPropsRef = React.useRef(sectionProps)
  sectionPropsRef.current = sectionProps
  React.useEffect(() => {
    const { error, data, isLoading } = racesByAddressRequest
    if (isLoading || !isRacesByAddressRequestActive.current) {
      return
    }

    if (data) {
      setErrorMessage(undefined)
      if (sectionPropsRef.current.currentSection === SectionNames.ADDRESS) {
        sectionPropsRef.current.goToSection(SectionNames.PLEDGE)
      }
    }

    if (error || !data) {
      Sentry.captureException(error, {
        tags: { domain: 'useRacesByAddress/onError' },
      })
      if (error instanceof Error || error?.message) {
        setErrorMessage(error.message)
      }
      if (sectionPropsRef.current.currentSection === SectionNames.PLEDGE) {
        sectionPropsRef.current.goToSection(SectionNames.ADDRESS)
      }
    }
  }, [racesByAddressRequest])

  const handleCreateAction = React.useCallback(async () => {
    if (isCreatingAction) {
      return
    }

    if (!address || !racesByAddressRequest.data) {
      throw new Error('Invalid address')
    }

    setIsCreatingAction(true)
    const addressSchema = await convertGooglePlaceAutoPredictionToAddressSchema(address)

    const data: CreateActionVoterAttestationInput = {
      campaignName: UserActionVoterAttestationCampaignName.DEFAULT,
      address: addressSchema,
      stateCode: racesByAddressRequest.data.stateCode as USStateCode,
    }

    const result = await triggerServerActionForForm(
      {
        formName: 'User Action Form Voter Attestation',
        analyticsProps: {
          ...convertAddressToAnalyticsProperties(data.address),
          'Campaign Name': data.campaignName,
          'User Action Type': UserActionType.VOTER_ATTESTATION,
        },
        payload: data,
        onError: toastGenericError,
      },
      payload => actionCreateUserActionVoterAttestation(payload),
    )

    if (result.status === 'error') {
      setIsCreatingAction(false)
      return toastGenericError()
    }

    router.refresh()
    sectionProps.goToSection(SectionNames.SUCCESS)
  }, [address, isCreatingAction, racesByAddressRequest.data, router, sectionProps])

  const handleLogin = React.useCallback(async () => {
    const data = await mutate()
    if (data?.user?.address) {
      setAddress({
        description: data.user.address.formattedDescription,
        place_id: data.user.address.googlePlaceId,
      })
      sectionPropsRef.current.goToSection(SectionNames.PLEDGE)
    }
  }, [mutate])

  switch (sectionProps.currentSection) {
    case SectionNames.INTRO:
      return (
        <Intro
          isLoading={racesByAddressRequest.isLoading}
          onContinue={() =>
            sectionProps.goToSection(
              racesByAddressRequest.data ? SectionNames.PLEDGE : SectionNames.ADDRESS,
            )
          }
        />
      )
    case SectionNames.ADDRESS:
      return (
        <div className={cn(dialogContentPaddingStyles, 'h-full')}>
          <AuthenticateWithoutProfileUpdate onLoginCallback={handleLogin}>
            <Address {...addressProps} />
          </AuthenticateWithoutProfileUpdate>
        </div>
      )
    case SectionNames.PLEDGE:
      return (
        <AuthenticateWithoutProfileUpdate onLoginCallback={handleLogin}>
          <PledgeSection
            address={address}
            isLoadingRaces={racesByAddressRequest.isLoading}
            isSubmitting={isCreatingAction}
            onChangeAddress={setAddress}
            onSuccess={handleCreateAction}
            racesByAddressData={racesByAddressRequest.data}
          />
        </AuthenticateWithoutProfileUpdate>
      )
    case SectionNames.SUCCESS:
      return (
        <div className={cn(dialogContentPaddingStyles)}>
          <UserActionFormSuccessScreen
            onClose={onClose}
            onLoad={() => {
              // This is necessary bc next keeps the scroll position when changing sections and this is the easiest way to get the right container to scroll
              document.querySelector('[role="dialog"]')?.scrollTo(0, 0)
            }}
          >
            <UserActionFormCallCongresspersonSuccess />
          </UserActionFormSuccessScreen>
        </div>
      )
    default:
      sectionProps.onSectionNotFound()
      return null
  }
}
