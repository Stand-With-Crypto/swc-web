'use client'

import React from 'react'
import { z } from 'zod'

import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { AuthenticateWithProfileUpdate } from '@/components/app/authentication/authenticateAndUpdateProfile'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_VOTER_ATTESTATION,
  SectionNames,
} from '@/components/app/userActionFormVoterAttestation/constants'
import { UserActionFormCallCongresspersonSuccess } from '@/components/app/userActionFormVoterAttestation/sections/success'
import { FormFields } from '@/components/app/userActionFormVoterAttestation/types'
import { DTSIPeopleFromCongressionalDistrict } from '@/hooks/useGetDTSIPeopleFromAddress'
import { useSections, UseSectionsReturn } from '@/hooks/useSections'
import { zodAddress } from '@/validation/fields/zodAddress'

import { Address, ChangeAddress } from './sections/address'
import { Intro } from './sections/intro'

type OnFindCongressPersonPayload = DTSIPeopleFromCongressionalDistrict & {
  addressSchema: z.infer<typeof zodAddress>
}

export interface VoterAttestationActionSharedData extends UseSectionsReturn<SectionNames> {
  user: GetUserFullProfileInfoResponse['user']
  onFindCongressperson: (payload: OnFindCongressPersonPayload) => void
  congressPersonData: OnFindCongressPersonPayload
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
  const hasDefaultAddress = !!user?.address || !!initialValues?.address

  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.INTRO,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_VOTER_ATTESTATION,
  })
  const { currentSection: currentTab, onSectionNotFound: onTabNotFound } = sectionProps

  const [congressPersonData, setCongresspersonData] = React.useState<OnFindCongressPersonPayload>()

  const addressProps = {
    congressPersonData,
    initialValues,
    user,
    onFindCongressperson: setCongresspersonData,
    ...sectionProps,
  }
  switch (currentTab) {
    case SectionNames.INTRO:
      return (
        <Intro
          onContinue={() =>
            sectionProps.goToSection(
              hasDefaultAddress && congressPersonData ? SectionNames.PLEDGE : SectionNames.ADDRESS,
            )
          }
        />
      )
    case SectionNames.ADDRESS:
      return (
        <AuthenticateWithProfileUpdate>
          <Address {...addressProps} />
        </AuthenticateWithProfileUpdate>
      )
    case SectionNames.CHANGE_ADDRESS:
      return <ChangeAddress {...addressProps} />
    case SectionNames.PLEDGE:
      return <h1>Hello World</h1>
    case SectionNames.SUCCESS:
      return (
        <UserActionFormSuccessScreen onClose={onClose}>
          <UserActionFormCallCongresspersonSuccess />
        </UserActionFormSuccessScreen>
      )
    default:
      onTabNotFound()
      return null
  }
}
