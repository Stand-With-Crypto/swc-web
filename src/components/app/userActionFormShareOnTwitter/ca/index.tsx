'use client'

import { UserActionType } from '@prisma/client'

import { actionCreateUserActionTweet } from '@/actions/actionCreateUserActionTweet'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER,
  SectionNames,
} from '@/components/app/userActionFormShareOnTwitter/common/constants'
import { ShareOnX } from '@/components/app/userActionFormShareOnTwitter/common/sections/share'
import { SuccessSection } from '@/components/app/userActionFormShareOnTwitter/common/sections/success'
import { UserActionFormShareOnTwitterProps } from '@/components/app/userActionFormShareOnTwitter/common/types'
import { useSections } from '@/hooks/useSections'
import { TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME } from '@/utils/shared/constants'
import { openWindow } from '@/utils/shared/openWindow'
import { fullUrl } from '@/utils/shared/urls'
import { createTweetLink } from '@/utils/web/createTweetLink'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { toastGenericError } from '@/utils/web/toastUtils'

export function CAUserActionFormShareOnTwitter({ onClose }: UserActionFormShareOnTwitterProps) {
  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.SHARE,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER,
  })

  const tweetMessage = `I #StandWithCrypto. More than ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME} people are already advocating for better crypto policy in Canada. Join the fight to receive email updates on crypto policy, invites to local events, and more.`
  const tweetUrl = fullUrl(
    '/action/sign-up?utm_source=twitter&utm_medium=social&utm_campaign=user-action-tweet-ca',
  )

  const caBenefits = [
    'Staying informed about crypto policy in Canada',
    'Supporting the Canadian crypto community',
    'Getting updates on important regulatory changes',
    "Being part of a movement that's shaping the future of finance in Canada",
  ]

  const handleSubmit = () => {
    void triggerServerActionForForm(
      {
        formName: 'User Action Form Share On Twitter [CA]',
        analyticsProps: {
          'User Action Type': UserActionType.TWEET,
        },
        payload: undefined,
        onError: toastGenericError,
      },
      () => actionCreateUserActionTweet(),
    ).then(result => {
      if (result.status === 'success') {
        sectionProps.goToSection(SectionNames.SUCCESS)
      }
    })

    openWindow(
      createTweetLink({ url: tweetUrl, message: tweetMessage }),
      'Twitter',
      'noopener, width=550,height=400',
    )
  }

  switch (sectionProps.currentSection) {
    case SectionNames.SHARE:
      return (
        <ShareOnX>
          <ShareOnX.Heading
            subtitle="Stay up to date on crypto policy changes in Canada"
            title="Follow @StandWithCrypto on Twitter"
          />

          <ShareOnX.Benefits benefits={caBenefits} />

          <ShareOnX.SubmitButton onClick={handleSubmit} text="Follow @StandWithCrypto" />
        </ShareOnX>
      )
    case SectionNames.SUCCESS:
      return <SuccessSection onClose={onClose} />
    default:
      return null
  }
}
