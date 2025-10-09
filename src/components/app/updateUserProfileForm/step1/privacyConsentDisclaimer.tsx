'use client'

import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { FormDescription } from '@/components/ui/form'
import { InternalLink } from '@/components/ui/link'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      textBeforeLink:
        'By completing your profile, you consent to and understand that SWC and its vendors may collect and use your personal information subject to',
      privacyPolicyLink: 'SWC Privacy Policy',
    },
    de: {
      textBeforeLink:
        'Durch das Ausfüllen Ihres Profils stimmen Sie zu und verstehen, dass SWC und seine Anbieter Ihre persönlichen Informationen gemäß der',
      privacyPolicyLink: 'SWC-Datenschutzrichtlinie',
    },
    fr: {
      textBeforeLink:
        'En complétant votre profil, vous consentez et comprenez que SWC et ses fournisseurs peuvent collecter et utiliser vos informations personnelles conformément à la',
      privacyPolicyLink: 'Politique de confidentialité de SWC',
    },
  },
})

export function PrivacyConsentDisclaimer({
  shouldShowConsentDisclaimer,
}: {
  shouldShowConsentDisclaimer: boolean
}) {
  const intlUrls = useIntlUrls()
  const { t } = useTranslation(i18nMessages, 'PrivacyConsentDisclaimer')

  return (
    <Collapsible open={shouldShowConsentDisclaimer}>
      <CollapsibleContent className="AnimateCollapsibleContent">
        <FormDescription className="text-center md:text-left">
          {t('textBeforeLink')}{' '}
          <InternalLink href={intlUrls.privacyPolicy()}>{t('privacyPolicyLink')}</InternalLink>.
        </FormDescription>
      </CollapsibleContent>
    </Collapsible>
  )
}
