import { CookieConsentFooterButton } from '@/components/app/cookieConsent/cookieConsentFooterButton'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import getIntl from '@/intl/intlMessages'
import { SupportedLocale } from '@/intl/locales'
import { externalUrls, getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

const i18nKey = 'FooterLinks'

const footerLinkStyles = cn('hover:underline font-bold block')

export async function Footer({ locale }: { locale: SupportedLocale }) {
  const intl = await getIntl(locale)
  const urls = getIntlUrls(locale)

  return (
    <footer className="my-10 border-t py-10">
      <div className="container">
        <div className="grids-col-1 mb-10 grid gap-4 sm:grid-cols-3">
          <div className="space-y-3 sm:space-y-9">
            <InternalLink className={footerLinkStyles} href={urls.termsOfService()}>
              {intl.formatMessage({
                defaultMessage: 'Terms of service',
                description: 'Label for terms of service footer item',
                id: `${i18nKey}.tos`,
              })}
            </InternalLink>
            <InternalLink className={footerLinkStyles} href={urls.privacyPolicy()}>
              {intl.formatMessage({
                defaultMessage: 'Privacy Policy',
                description: 'Label for privacy policy footer item',
                id: `${i18nKey}.privacyPolicy`,
              })}
            </InternalLink>
            <ExternalLink className={footerLinkStyles} href={externalUrls.emailFeedback()}>
              {intl.formatMessage({
                defaultMessage: 'Send feedback',
                description: 'Label for send feedback footer item',
                id: `${i18nKey}.feedback`,
              })}
            </ExternalLink>
            <CookieConsentFooterButton
              className={cn(footerLinkStyles, 'h-auto p-0 text-base')}
              variant={'link'}
            />
          </div>
          <div className="space-y-3 sm:space-y-9">
            <ExternalLink className={footerLinkStyles} href={externalUrls.twitter()}>
              {intl.formatMessage({
                defaultMessage: 'Twitter / X',
                description: 'Label for twitter footer item',
                id: `${i18nKey}.twitterV2`,
              })}
            </ExternalLink>
            <ExternalLink className={footerLinkStyles} href={externalUrls.youtube()}>
              {intl.formatMessage({
                defaultMessage: 'Youtube',
                description: 'Label for Youtube footer item',
                id: `${i18nKey}.youtube`,
              })}
            </ExternalLink>
            <ExternalLink className={footerLinkStyles} href={externalUrls.instagram()}>
              {intl.formatMessage({
                defaultMessage: 'Instagram',
                description: 'Label for instagram footer item',
                id: `${i18nKey}.instagram`,
              })}
            </ExternalLink>
          </div>
          <div className="space-y-3 sm:space-y-9">
            <ExternalLink className={footerLinkStyles} href={externalUrls.facebook()}>
              {intl.formatMessage({
                defaultMessage: 'Facebook',
                description: 'Label for Facebook footer item',
                id: `${i18nKey}.facebook`,
              })}
            </ExternalLink>
            <ExternalLink className={footerLinkStyles} href={externalUrls.linkedin()}>
              {intl.formatMessage({
                defaultMessage: 'LinkedIn',
                description: 'Label for LinkedIn footer item',
                id: `${i18nKey}.linkedIn`,
              })}
            </ExternalLink>
            <ExternalLink className={footerLinkStyles} href={externalUrls.discord()}>
              {intl.formatMessage({
                defaultMessage: 'Discord',
                description: 'Label for Discord footer item',
                id: `${i18nKey}.discord`,
              })}
            </ExternalLink>
          </div>
        </div>
        <div className="mb-2 text-xs text-fontcolor-muted">
          Information about people's stances on crypto sourced from{' '}
          <a className={'hover:underline'} href="https://www.dotheysupportit.com/" target="_blank">
            DoTheySupportIt.com
          </a>
        </div>
        <div className="text-sm text-fontcolor-muted">
          {intl.formatMessage({
            defaultMessage: 'Stand with Crypto ©️ All rights reserved 2023',
            description: 'Copyright text',
            id: `${i18nKey}.copyright`,
          })}
        </div>
      </div>
    </footer>
  )
}
