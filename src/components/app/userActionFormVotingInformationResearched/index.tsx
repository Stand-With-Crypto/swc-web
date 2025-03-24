'use client'

import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { SectionsNames } from '@/components/app/userActionFormVotingInformationResearched/constants'
import { UserActionFormVotingInformationResearchedSuccess } from '@/components/app/userActionFormVotingInformationResearched/sections/success'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { UseSectionsReturn } from '@/hooks/useSections'

import { Address } from './sections/address'
import { VotingInformationResearchedFormValues } from './formConfig'

export interface UserActionFormVotingInformationResearchedProps
  extends UseSectionsReturn<SectionsNames> {
  onClose: () => void
  initialValues: Omit<VotingInformationResearchedFormValues, 'address'> & {
    address?: VotingInformationResearchedFormValues['address']
  }
}

export const UserActionFormVotingInformationResearched = (
  props: UserActionFormVotingInformationResearchedProps,
) => {
  const { onClose, initialValues, ...sectionProps } = props

  switch (sectionProps.currentSection) {
    case SectionsNames.LOADING:
      return (
        <div className="min-h-[400px]">
          <LoadingOverlay />
        </div>
      )
    case SectionsNames.ADDRESS:
      return (
        <Address
          initialValues={initialValues}
          onSuccess={() => sectionProps.goToSection(SectionsNames.SUCCESS)}
        />
      )
    case SectionsNames.SUCCESS:
      return (
        <UserActionFormSuccessScreen onClose={onClose}>
          <UserActionFormVotingInformationResearchedSuccess />
        </UserActionFormSuccessScreen>
      )
    default:
      sectionProps.onSectionNotFound()
      return null
  }
}
