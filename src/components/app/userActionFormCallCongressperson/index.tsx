'use client'

import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'

import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_CALL_CONGRESSPERSON,
  SectionNames,
} from '@/components/app/userActionFormCallCongressperson/constants'
import { UserActionFormCallCongresspersonSuccess } from '@/components/app/userActionFormCallCongressperson/sections/success'
import { FormFields } from '@/components/app/userActionFormCallCongressperson/types'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { DTSIPeopleFromUSCongressionalDistrict } from '@/hooks/useGetDTSIPeopleFromUSAddress'
import { useSections, UseSectionsReturn } from '@/hooks/useSections'
import { zodAddress } from '@/validation/fields/zodAddress'

import { Address, ChangeAddress, useCongresspersonData } from './sections/address'
import { Intro } from './sections/intro'
import { SuggestedScript } from './sections/suggestedScript'

type OnFindCongressPersonPayload = DTSIPeopleFromUSCongressionalDistrict & {
  addressSchema: z.infer<typeof zodAddress>
}

export interface CallCongresspersonActionSharedData extends UseSectionsReturn<SectionNames> {
  user: GetUserFullProfileInfoResponse['user']
  onFindCongressperson: (payload: OnFindCongressPersonPayload) => void
  congressPersonData: OnFindCongressPersonPayload
}

interface UserActionFormCallCongresspersonProps {
  user: GetUserFullProfileInfoResponse['user']
  onClose: () => void
  initialValues?: FormFields
}

export function UserActionFormCallCongressperson({
  user,
  onClose,
  initialValues,
}: UserActionFormCallCongresspersonProps) {
  const hasDefaultAddress = !!user?.address || !!initialValues?.address

  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.INTRO,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_CALL_CONGRESSPERSON,
  })
  const { currentSection: currentTab, onSectionNotFound: onTabNotFound } = sectionProps

  const [congressPersonData, setCongresspersonData] = React.useState<OnFindCongressPersonPayload>()

  const initialAddress = initialValues?.address
    ? initialValues.address
    : user?.address?.route
      ? { place_id: user.address.googlePlaceId, description: user.address.formattedDescription }
      : undefined
  const { data: resolvedCongressPersonData, isLoading: isLoadingInitialCongresspersonData } =
    useCongresspersonData({ address: initialAddress })

  React.useEffect(() => {
    if (resolvedCongressPersonData && 'dtsiPeople' in resolvedCongressPersonData) {
      setCongresspersonData(resolvedCongressPersonData)
    }
  }, [resolvedCongressPersonData])

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
          loading={isLoadingInitialCongresspersonData}
          onContinue={() =>
            sectionProps.goToSection(
              hasDefaultAddress && congressPersonData
                ? SectionNames.SUGGESTED_SCRIPT
                : SectionNames.ADDRESS,
            )
          }
        />
      )
    case SectionNames.ADDRESS:
      return <Address {...addressProps} />
    case SectionNames.CHANGE_ADDRESS:
      return <ChangeAddress {...addressProps} />
    case SectionNames.SUGGESTED_SCRIPT:
      // This should never happen in the normal tab flow, but if it does, we want to know about it
      if (!congressPersonData || 'notFoundReason' in congressPersonData) {
        const err = new Error('Call Action - Missing congressPersonData')
        Sentry.captureException(err, {
          user: { id: user?.id },
        })
        throw err
      }

      return (
        <SuggestedScript congressPersonData={congressPersonData} user={user} {...sectionProps} />
      )
    case SectionNames.SUCCESS_MESSAGE:
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
