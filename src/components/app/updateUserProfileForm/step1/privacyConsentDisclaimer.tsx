import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { FormDescription } from '@/components/ui/form'
import { InternalLink } from '@/components/ui/link'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      privacyConsentDisclaimerPart1:
        'By completing your profile, you consent to and understand that SWC and its vendors may collect and use your personal information subject to',
      privacyConsentDisclaimerPart2: 'SWC Privacy Policy',
    },
    fr: {
      privacyConsentDisclaimerPart1:
        'En complétant votre profil, vous consentez et comprenez que SWC et ses fournisseurs peuvent collecter et utiliser vos informations personnelles conformément à',
      privacyConsentDisclaimerPart2: 'la Politique de Confidentialité de SWC',
    },
    de: {
      privacyConsentDisclaimerPart1:
        'Durch das Ausfüllen Ihres Profils stimmen Sie zu und verstehen, dass SWC und seine Anbieter Ihre persönlichen Daten gemäß',
      privacyConsentDisclaimerPart2: 'der Datenschutzrichtlinie von SWC',
    },
  },
})

export function PrivacyConsentDisclaimer({
  shouldShowConsentDisclaimer,
}: {
  shouldShowConsentDisclaimer: boolean
}) {
  const intlUrls = useIntlUrls()
  const { t } = useTranslation(i18nMessages)

  return (
    <Collapsible open={shouldShowConsentDisclaimer}>
      <CollapsibleContent className="AnimateCollapsibleContent">
        <FormDescription className="text-center md:text-left">
          {t('privacyConsentDisclaimerPart1')}{' '}
          <InternalLink href={intlUrls.privacyPolicy()}>
            {t('privacyConsentDisclaimerPart2')}
          </InternalLink>
          .
        </FormDescription>
      </CollapsibleContent>
    </Collapsible>
  )
}
