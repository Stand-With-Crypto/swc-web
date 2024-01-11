import { CookieConsentFooterButton } from '@/components/app/cookieConsent/cookieConsentFooterButton'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import getIntl from '@/intl/intlMessages'
import { SupportedLocale } from '@/intl/locales'
import { PageProps } from '@/types'
import { externalUrls, getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'
import { defineMessages } from 'react-intl'

const i18nKey = 'FooterLinks'

const footerLinkStyles = cn('hover:underline font-bold block')

export async function Footer({ locale }: { locale: SupportedLocale }) {
  const intl = await getIntl(locale)
  const urls = getIntlUrls(locale)

  return (
    <footer className="container mx-auto my-20">
      <div className="grids-col-1 mb-10 grid gap-4 sm:grid-cols-3">
        <div className="space-y-3 sm:space-y-9">
          <InternalLink className={footerLinkStyles} href={urls.termsOfService()}>
            {intl.formatMessage({
              id: `${i18nKey}.tos`,
              defaultMessage: 'Terms of service',
              description: 'Label for terms of service footer item',
            })}
          </InternalLink>
          <InternalLink className={footerLinkStyles} href={urls.privacyPolicy()}>
            {intl.formatMessage({
              id: `${i18nKey}.privacyPolicy`,
              defaultMessage: 'Privacy Policy',
              description: 'Label for privacy policy footer item',
            })}
          </InternalLink>
          <ExternalLink className={footerLinkStyles} href={externalUrls.emailFeedback()}>
            {intl.formatMessage({
              id: `${i18nKey}.feedback`,
              defaultMessage: 'Send feedback',
              description: 'Label for send feedback footer item',
            })}
          </ExternalLink>
          <CookieConsentFooterButton
            variant={'link'}
            className={cn(footerLinkStyles, 'h-auto p-0 text-base')}
          />
        </div>
        <div className="space-y-3 sm:space-y-9">
          <ExternalLink className={footerLinkStyles} href={externalUrls.twitter()}>
            {intl.formatMessage({
              id: `${i18nKey}.twitterV2`,
              defaultMessage: 'Twitter / X',
              description: 'Label for twitter footer item',
            })}
          </ExternalLink>
          <ExternalLink className={footerLinkStyles} href={externalUrls.youtube()}>
            {intl.formatMessage({
              id: `${i18nKey}.youtube`,
              defaultMessage: 'Youtube',
              description: 'Label for Youtube footer item',
            })}
          </ExternalLink>
          <ExternalLink className={footerLinkStyles} href={externalUrls.instagram()}>
            {intl.formatMessage({
              id: `${i18nKey}.instagram`,
              defaultMessage: 'Instagram',
              description: 'Label for instagram footer item',
            })}
          </ExternalLink>
        </div>
        <div className="space-y-3 sm:space-y-9">
          <ExternalLink className={footerLinkStyles} href={externalUrls.facebook()}>
            {intl.formatMessage({
              id: `${i18nKey}.facebook`,
              defaultMessage: 'Facebook',
              description: 'Label for Facebook footer item',
            })}
          </ExternalLink>
          <ExternalLink className={footerLinkStyles} href={externalUrls.linkedin()}>
            {intl.formatMessage({
              id: `${i18nKey}.linkedIn`,
              defaultMessage: 'LinkedIn',
              description: 'Label for LinkedIn footer item',
            })}
          </ExternalLink>
          <ExternalLink className={footerLinkStyles} href={externalUrls.discord()}>
            {intl.formatMessage({
              id: `${i18nKey}.discord`,
              defaultMessage: 'Discord',
              description: 'Label for Discord footer item',
            })}
          </ExternalLink>
        </div>
      </div>
      <div className="mb-2 text-xs text-fontcolor-muted">
        Information about people's stances on crypto sourced from{' '}
        <a target="_blank" href="https://www.dotheysupportit.com/" className={'hover:underline'}>
          DoTheySupportIt.com
        </a>
      </div>
      <div className="text-sm text-fontcolor-muted">
        {intl.formatMessage({
          id: `${i18nKey}.copyright`,
          defaultMessage: 'Stand with Crypto ©️ All rights reserved 2023',
          description: 'Copyright text',
        })}
      </div>
    </footer>
  )
}
