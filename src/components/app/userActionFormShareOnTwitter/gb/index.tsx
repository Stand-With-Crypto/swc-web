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
import { GBUserActionTweetCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { toastGenericError } from '@/utils/web/toastUtils'

export function GBUserActionFormShareOnTwitter({ onClose }: UserActionFormShareOnTwitterProps) {
  const searchParams = useSearchParams()

  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.SHARE,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER,
  })

  const gbBenefits = [
    'Staying informed about crypto policy in the GB',
    'Supporting the British crypto community',
    'Getting updates on important regulatory changes',
    "Being part of a movement that's shaping the future of finance in Britain",
  ]

  const handleSubmit = () => {
    const target = searchParams?.get('target') ?? '_blank'

    void triggerServerActionForForm(
      {
        formName: 'User Action Form Share On Twitter [GB]',
        analyticsProps: {
          'User Action Type': UserActionType.TWEET,
        },
        payload: {
          campaignName: GBUserActionTweetCampaignName.DEFAULT,
        },
        onError: toastGenericError,
      },
      actionCreateUserActionTweet,
    ).then(result => {
      if (result.status === 'success') {
        sectionProps.goToSection(SectionNames.SUCCESS)
      }
    })

    openWindow('https://x.com/StandWCrypto_UK', target, `noopener`)
  }

  switch (sectionProps.currentSection) {
    case SectionNames.SHARE:
      return (
        <ShareOnX>
          <ShareOnX.Heading
            subtitle="Stay up to date on crypto policy changes in the UK"
            title="Follow @StandWCrypto_UK on Twitter"
          />

          <ShareOnX.Benefits benefits={gbBenefits} />

          <ShareOnX.SubmitButton onClick={handleSubmit} text="Follow @StandWCrypto_UK" />
        </ShareOnX>
      )
    case SectionNames.SUCCESS:
      return <SuccessSection onClose={onClose} />
    default:
      return null
  }
}
