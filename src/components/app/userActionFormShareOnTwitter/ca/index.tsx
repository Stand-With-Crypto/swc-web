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
import { caExternalUrls } from '@/utils/shared/urls'
import { CAUserActionTweetCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { toastGenericError } from '@/utils/web/toastUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.CA

export function CAUserActionFormShareOnTwitter({ onClose }: UserActionFormShareOnTwitterProps) {
  const searchParams = useSearchParams()

  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.SHARE,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER,
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
        formName: 'User Action Form Share On Twitter',
        analyticsProps: {
          'User Action Type': UserActionType.TWEET,
        },
        payload: { campaignName: CAUserActionTweetCampaignName.DEFAULT },
        onError: toastGenericError,
      },
      actionCreateUserActionTweet,
    ).then(result => {
      if (result.status === 'success') {
        sectionProps.goToSection(SectionNames.SUCCESS)
      }
    })

    openWindow(caExternalUrls.twitter(), target, `noopener`)
  }

  switch (sectionProps.currentSection) {
    case SectionNames.SHARE:
      return (
        <ShareOnX>
          <ShareOnX.Heading
            subtitle="Stay up to date on crypto policy changes in Canada"
            title="Follow @StandWCrypto_CA on Twitter"
          />

          <ShareOnX.Benefits benefits={caBenefits} />

          <ShareOnX.SubmitButton onClick={handleSubmit} text="Follow @StandWCrypto_CA" />
        </ShareOnX>
      )
    case SectionNames.SUCCESS:
      return <SuccessSection onClose={onClose} countryCode={countryCode} />
    default:
      return null
  }
}
