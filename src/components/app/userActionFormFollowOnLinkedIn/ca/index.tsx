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
import { caExternalUrls } from '@/utils/shared/urls'
import { CAUserActionLinkedInCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { toastGenericError } from '@/utils/web/toastUtils'

export function CAUserActionFormFollowLinkedIn({ onClose }: UserActionFormFollowLinkedInProps) {
  const searchParams = useSearchParams()

  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.FOLLOW,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_FOLLOW_LINKEDIN,
  })

  const caBenefits = [
    'Staying informed about crypto policy in Canada',
    'Supporting the Canadian crypto community',
    'Getting updates on important regulatory changes',
    "Being part of a movement that's shaping the future of finance in Canada",
  ]

  const handleSubmit = () => {
    const target = searchParams?.get('target') ?? '_blank'

    void triggerServerActionForForm(
      {
        formName: 'User Action Form Follow LinkedIn',
        analyticsProps: {
          'User Action Type': UserActionType.LINKEDIN,
        },
        payload: { campaignName: CAUserActionLinkedInCampaignName.DEFAULT },
        onError: toastGenericError,
      },
      actionCreateUserActionLinkedIn,
    ).then(result => {
      if (result.status === 'success') {
        sectionProps.goToSection(SectionNames.SUCCESS)
      }
    })

    openWindow(caExternalUrls.linkedin(), target, `noopener`)
  }

  switch (sectionProps.currentSection) {
    case SectionNames.FOLLOW:
      return (
        <FollowLinkedIn>
          <FollowLinkedIn.Heading
            subtitle="Stay up to date on crypto policy changes in Canada"
            title="Follow us on LinkedIn"
          />

          <FollowLinkedIn.Benefits benefits={caBenefits} />

          <FollowLinkedIn.SubmitButton onClick={handleSubmit} text="Follow us on LinkedIn" />
        </FollowLinkedIn>
      )
    case SectionNames.SUCCESS:
      return <SuccessSection onClose={onClose} />
    default:
      return null
  }
}
