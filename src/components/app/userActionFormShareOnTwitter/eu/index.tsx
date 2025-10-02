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
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { openWindow } from '@/utils/shared/openWindow'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { euExternalUrls } from '@/utils/shared/urls'
import { EUUserActionTweetCampaignName } from '@/utils/shared/userActionCampaigns/eu/euUserActionCampaigns'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { useTranslation } from '@/utils/web/i18n/useTranslation'
import { toastGenericError } from '@/utils/web/toastUtils'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      title: 'Follow @StandWCrypto_EU on Twitter',
      subtitle: 'Stay up to date on crypto policy changes in Europe',
      benefit1: 'Staying informed about crypto policy in Europe',
      benefit2: 'Supporting the European crypto community',
      benefit3: 'Getting updates on important regulatory changes',
      benefit4: "Being part of a movement that's shaping the future of finance in Europe",
    },
    fr: {
      title: 'Suivez @StandWCrypto_EU sur Twitter',
      subtitle: 'Restez informés des changements de politique crypto en Europe',
      benefit1: 'Rester informé de la politique crypto en Europe',
      benefit2: 'Soutenir la communauté crypto européenne',
      benefit3: 'Recevoir des mises à jour sur les changements réglementaires importants',
      benefit4: "Faire partie d'un mouvement qui façonne l'avenir de la finance en Europe",
    },
    de: {
      title: 'Folge @StandWCrypto_EU auf Twitter',
      subtitle: 'Bleibe auf dem Laufenden über Änderungen der Krypto-Politik in Europa',
      benefit1: 'Über Krypto-Politik in Europa informiert bleiben',
      benefit2: 'Die europäische Krypto-Community unterstützen',
      benefit3: 'Updates zu wichtigen regulatorischen Änderungen erhalten',
      benefit4: 'Teil einer Bewegung sein, die die Zukunft der Finanzwelt in Europa prägt',
    },
  },
})

const countryCode = SupportedCountryCodes.EU

export function EUUserActionFormShareOnTwitter({ onClose }: UserActionFormShareOnTwitterProps) {
  const { t, language } = useTranslation(i18nMessages, 'EUUserActionFormShareOnTwitter')
  const searchParams = useSearchParams()

  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.SHARE,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_SHARE_ON_TWITTER,
  })

  const euBenefits = [t('benefit1'), t('benefit2'), t('benefit3'), t('benefit4')]

  const handleSubmit = () => {
    const target = searchParams?.get('target') ?? '_blank'

    void triggerServerActionForForm(
      {
        formName: 'User Action Form Share On Twitter',
        analyticsProps: {
          'User Action Type': UserActionType.TWEET,
        },
        payload: { campaignName: EUUserActionTweetCampaignName.DEFAULT },
        onError: toastGenericError,
      },
      actionCreateUserActionTweet,
    ).then(result => {
      if (result.status === 'success') {
        sectionProps.goToSection(SectionNames.SUCCESS)
      }
    })

    openWindow(euExternalUrls.twitter(), target, `noopener`)
  }

  switch (sectionProps.currentSection) {
    case SectionNames.SHARE:
      return (
        <ShareOnX>
          <ShareOnX.Heading subtitle={t('subtitle')} title={t('title')} />

          <ShareOnX.Benefits benefits={euBenefits} />

          <ShareOnX.SubmitButton onClick={handleSubmit} text={t('title')} />
        </ShareOnX>
      )
    case SectionNames.SUCCESS:
      return <SuccessSection countryCode={countryCode} language={language} onClose={onClose} />
    default:
      return null
  }
}
