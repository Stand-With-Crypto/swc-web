'use client'

import {
  ANALYTICS_NAME_USER_ACTION_FORM_REFER,
  SectionNames,
} from '@/components/app/userActionFormRefer/common/constants'
import { Refer } from '@/components/app/userActionFormRefer/common/sections/refer'
import { SuccessSection } from '@/components/app/userActionFormRefer/common/sections/success'
import { UserActionFormReferProps } from '@/components/app/userActionFormRefer/common/types'
import { useSections } from '@/hooks/useSections'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      description:
        'Send friends your unique referral code to encourage them to sign up and take action.',
    },
    de: {
      description:
        'Sende deinen Freunden deinen persönlichen Empfehlungscode, um sie dazu zu ermutigen, sich anzumelden und zu handeln.',
    },
    fr: {
      description:
        "Envoyez à vos amis votre code de parrainage unique pour les encourager à s'inscrire et à agir.",
    },
  },
})

export function EUUserActionFormRefer({ onClose }: UserActionFormReferProps) {
  const { t } = useTranslation(i18nMessages, 'EUUserActionFormRefer')

  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.REFER,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_REFER,
  })

  switch (sectionProps.currentSection) {
    case SectionNames.REFER:
      return (
        <Refer>
          <Refer.Heading description={t('description')} />

          <Refer.ReferralCode />

          <Refer.Counter className="flex-col md:flex-row">
            <Refer.Counter.UserReferralsCount />
          </Refer.Counter>
        </Refer>
      )
    case SectionNames.SUCCESS:
      return <SuccessSection onClose={onClose} />
    default:
      sectionProps.onSectionNotFound()
      return null
  }
}
