import { getYear } from 'date-fns'
import { useRouter } from 'next/router'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { CookieConsentFooterButton } from '@/components/app/cookieConsent/cookieConsentFooterButton'
import { Button } from '@/components/ui/button'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { PageTitle } from '@/components/ui/pageTitleText'
import getIntl from '@/intl/intlMessages'
import { SupportedLocale } from '@/intl/locales'
import { externalUrls, getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

const i18nKey = 'FooterLinks'

const footerLinkStyles = cn('block text-gray-400')

export async function Footer({ locale }: { locale: SupportedLocale }) {
  const intl = await getIntl(locale)
  const urls = getIntlUrls(locale)

  const router = useRouter()

  if (router.pathname === 'campaign/shield') {
    return null
  }

  return (
    <footer className="mt-36 border-t bg-black py-24 text-muted antialiased">
      <div className="container">
        <div className="flex flex-col gap-9 lg:flex-row lg:justify-between">
          <div className="max-w-xl space-y-8">
            <PageTitle as="h6" className="text-left">
              Fight for the future
            </PageTitle>
            <p className="text-xl">
              Join to show your support, collect advocacy NFTs, and protect the future of crypto.
              #standwithcrypto
            </p>
            <LoginDialogWrapper
              authenticatedContent={
                <Button asChild size="lg" variant="primary-cta">
                  <InternalLink href={urls.profile()}>View your profile</InternalLink>
                </Button>
              }
            >
              <Button size="lg" variant="primary-cta">
                Join the movement
              </Button>
            </LoginDialogWrapper>
          </div>
          <div className="mb-10 grid max-w-xl flex-shrink-0 grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-3 sm:space-y-6">
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
            <div className="space-y-3 sm:space-y-6">
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
                className={cn(footerLinkStyles, 'h-auto p-0 text-base')}
                variant={'link'}
              />
              <InternalLink className={footerLinkStyles} href={urls.contribute()}>
                Contribute
              </InternalLink>
            </div>
          </div>
        </div>
        <div className="mb-2 text-xs text-muted">
          Information about people’s stances on crypto sourced from{' '}
          <a className={'hover:underline'} href="https://www.dotheysupportit.com/" target="_blank">
            DoTheySupportIt.com
          </a>{' '}
          For more information, visit DoTheySupportIt’s{' '}
          <a
            className={'hover:underline'}
            href="https://www.dotheysupportit.com/privacy-policy"
            target="_blank"
          >
            privacy policy
          </a>{' '}
          and{' '}
          <a
            className={'hover:underline'}
            href="https://www.dotheysupportit.com/terms-and-conditions"
            target="_blank"
          >
            terms and conditions
          </a>
          .
        </div>
        <div className="text-sm text-muted">
          Stand With Crypto ©️ All rights reserved {getYear(new Date())}
        </div>
      </div>
    </footer>
  )
}
