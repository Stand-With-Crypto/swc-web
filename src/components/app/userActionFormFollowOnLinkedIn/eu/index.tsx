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
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { openWindow } from '@/utils/shared/openWindow'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { euExternalUrls } from '@/utils/shared/urls'
import { EUUserActionLinkedInCampaignName } from '@/utils/shared/userActionCampaigns/eu/euUserActionCampaigns'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { useLanguage } from '@/utils/web/i18n/useLanguage'
import { useTranslation } from '@/utils/web/i18n/useTranslation'
import { toastGenericError } from '@/utils/web/toastUtils'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      title: 'Follow us on LinkedIn',
      subtitle: 'Stay up to date on crypto policy changes in Europe',
      benefit1: 'Staying informed about crypto policy in Europe',
      benefit2: 'Supporting the European crypto community',
      benefit3: 'Getting updates on important regulatory changes',
      benefit4: "Being part of a movement that's shaping the future of finance in Europe",
      followButton: 'Follow us on LinkedIn',
    },
    fr: {
      title: 'Suivez-nous sur LinkedIn',
      subtitle: 'Restez informés des changements de politique crypto en Europe',
      benefit1: 'Rester informé de la politique crypto en Europe',
      benefit2: 'Soutenir la communauté crypto européenne',
      benefit3: 'Recevoir des mises à jour sur les changements réglementaires importants',
      benefit4: "Faire partie d'un mouvement qui façonne l'avenir de la finance en Europe",
      followButton: 'Suivez-nous sur LinkedIn',
    },
    de: {
      title: 'Folge uns auf LinkedIn',
      subtitle: 'Bleibe auf dem Laufenden über Änderungen der Krypto-Politik in Europa',
      benefit1: 'Über die Krypto-Politik in Europa informiert bleiben',
      benefit2: 'Die europäische Krypto-Gemeinschaft unterstützen',
      benefit3: 'Updates zu wichtigen regulatorischen Änderungen erhalten',
      benefit4: 'Teil einer Bewegung sein, die die Zukunft der Finanzen in Europa gestaltet',
      followButton: 'Folge uns auf LinkedIn',
    },
  },
})

const countryCode = SupportedCountryCodes.EU

export function EUUserActionFormFollowLinkedIn({ onClose }: UserActionFormFollowLinkedInProps) {
  const { t } = useTranslation(i18nMessages, 'EUUserActionFormFollowLinkedIn')

  const language = useLanguage()

  const searchParams = useSearchParams()

  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.FOLLOW,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_FOLLOW_LINKEDIN,
  })

  const euBenefits = [t('benefit1'), t('benefit2'), t('benefit3'), t('benefit4')]

  const handleSubmit = () => {
    const target = searchParams?.get('target') ?? '_blank'

    void triggerServerActionForForm(
      {
        formName: 'User Action Form Follow LinkedIn',
        analyticsProps: {
          'User Action Type': UserActionType.LINKEDIN,
        },
        payload: { campaignName: EUUserActionLinkedInCampaignName.DEFAULT },
        onError: toastGenericError,
      },
      actionCreateUserActionLinkedIn,
    ).then(result => {
      if (result.status === 'success') {
        sectionProps.goToSection(SectionNames.SUCCESS)
      }
    })

    openWindow(euExternalUrls.linkedin(), target, `noopener`)
  }

  switch (sectionProps.currentSection) {
    case SectionNames.FOLLOW:
      return (
        <FollowLinkedIn>
          <FollowLinkedIn.Heading subtitle={t('subtitle')} title={t('title')} />

          <FollowLinkedIn.Benefits benefits={euBenefits} />

          <FollowLinkedIn.SubmitButton onClick={handleSubmit} text={t('followButton')} />
        </FollowLinkedIn>
      )
    case SectionNames.SUCCESS:
      return <SuccessSection countryCode={countryCode} language={language} onClose={onClose} />
    default:
      return null
  }
}
