'use client'

import { UserActionType } from '@prisma/client'
import { useSearchParams } from 'next/navigation'

import { actionCreateUserActionLinkedIn } from '@/actions/actionCreateUserActionLinkedIn'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_FOLLOW_LINKEDIN,
  SectionNames,
} from '@/components/app/userActionFormFollowOnLinkedIn/common/constants'
import { FollowLinkedIn } from '@/components/app/userActionFormFollowOnLinkedIn/common/sections/follow'
import { SuccessSection } from '@/components/app/userActionFormFollowOnLinkedIn/common/sections/success'
import { UserActionFormFollowLinkedInProps } from '@/components/app/userActionFormFollowOnLinkedIn/common/types'
import { useSections } from '@/hooks/useSections'
import { openWindow } from '@/utils/shared/openWindow'
import { gbExternalUrls } from '@/utils/shared/urls'
import { GBUserActionLinkedInCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { toastGenericError } from '@/utils/web/toastUtils'

export function GBUserActionFormFollowLinkedIn({ onClose }: UserActionFormFollowLinkedInProps) {
  const searchParams = useSearchParams()

  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.FOLLOW,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_FOLLOW_LINKEDIN,
  })

  const gbBenefits = [
    'Staying informed about crypto policy in the GB',
    'Supporting the British crypto community',
    'Getting updates on important regulatory changes',
    "Being part of a movement that's shaping the future of finance in the UK",
  ]

  const handleSubmit = () => {
    const target = searchParams?.get('target') ?? '_blank'

    void triggerServerActionForForm(
      {
        formName: 'User Action Form Follow LinkedIn [GB]',
        analyticsProps: {
          'User Action Type': UserActionType.LINKEDIN,
        },
        payload: {
          campaignName: GBUserActionLinkedInCampaignName.DEFAULT,
        },
        onError: toastGenericError,
      },
      actionCreateUserActionLinkedIn,
    ).then(result => {
      if (result.status === 'success') {
        sectionProps.goToSection(SectionNames.SUCCESS)
      }
    })

    openWindow(gbExternalUrls.linkedin(), target, `noopener`)
  }

  switch (sectionProps.currentSection) {
    case SectionNames.FOLLOW:
      return (
        <FollowLinkedIn>
          <FollowLinkedIn.Heading
            subtitle="Stay up to date on crypto policy changes in the UK"
            title="Follow us on LinkedIn"
          />

          <FollowLinkedIn.Benefits benefits={gbBenefits} />

          <FollowLinkedIn.SubmitButton onClick={handleSubmit} text="Follow us on LinkedIn" />
        </FollowLinkedIn>
      )
    case SectionNames.SUCCESS:
      return <SuccessSection onClose={onClose} />
    default:
      return null
  }
}
