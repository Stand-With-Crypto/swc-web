'use client'

import { UserActionType } from '@prisma/client'
import { useSearchParams } from 'next/navigation'

import { actionCreateUserActionTweet } from '@/actions/actionCreateUserActionTweet'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER,
  SectionNames,
} from '@/components/app/userActionFormShareOnTwitter/common/constants'
import { ShareOnX } from '@/components/app/userActionFormShareOnTwitter/common/sections/share'
import { SuccessSection } from '@/components/app/userActionFormShareOnTwitter/common/sections/success'
import { UserActionFormShareOnTwitterProps } from '@/components/app/userActionFormShareOnTwitter/common/types'
import { useSections } from '@/hooks/useSections'
import { openWindow } from '@/utils/shared/openWindow'
import { usExternalUrls } from '@/utils/shared/urls'
import { USUserActionTweetCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { toastGenericError } from '@/utils/web/toastUtils'

export function USUserActionFormShareOnTwitter({ onClose }: UserActionFormShareOnTwitterProps) {
  const searchParams = useSearchParams()

  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.SHARE,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER,
  })

  const usBenefits = [
    'Staying informed about crypto policy in America',
    'Supporting the crypto community',
    'Getting updates on important regulatory changes',
    "Being part of a movement that's shaping the future of finance",
  ]

  const handleSubmit = () => {
    const target = searchParams?.get('target') ?? '_blank'
    void triggerServerActionForForm(
      {
        formName: 'User Action Form Share On Twitter',
        analyticsProps: {
          'User Action Type': UserActionType.TWEET,
        },
        payload: { campaignName: USUserActionTweetCampaignName.DEFAULT },
        onError: toastGenericError,
      },
      actionCreateUserActionTweet,
    ).then(result => {
      if (result.status === 'success') {
        sectionProps.goToSection(SectionNames.SUCCESS)
      }
    })

    openWindow(usExternalUrls.twitter(), target, `noopener`)
  }

  switch (sectionProps.currentSection) {
    case SectionNames.SHARE:
      return (
        <ShareOnX>
          <ShareOnX.Heading
            subtitle="Stay up to date on crypto policy changes in America"
            title="Follow @StandWithCrypto on Twitter"
          />

          <ShareOnX.Benefits benefits={usBenefits} />

          <ShareOnX.SubmitButton onClick={handleSubmit} text="Follow @StandWithCrypto" />
        </ShareOnX>
      )
    case SectionNames.SUCCESS:
      return <SuccessSection onClose={onClose} />
    default:
      sectionProps.onSectionNotFound()
      return null
  }
}
