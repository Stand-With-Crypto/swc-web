import { getYear } from 'date-fns'

import { CookieConsentFooterButton } from '@/components/app/cookieConsent/cookieConsentFooterButton'
import { HeroCTA } from '@/components/app/pageHome/heroCTA'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { DEFAULT_PAGE_TITLE_SIZE, PageTitle } from '@/components/ui/pageTitleText'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { externalUrls, getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

const footerLinkStyles = cn('block text-gray-400')

export async function Footer({ locale }: { locale: SupportedLocale }) {
  const urls = getIntlUrls(locale)

  return (
    <footer className="mt-36 border-t bg-black py-24 text-muted antialiased">
      <div className="container">
        <div className="flex flex-col gap-9 lg:flex-row lg:justify-between">
          <div className="max-w-2xl space-y-8">
            <PageTitle as="h6" className="text-left" size={DEFAULT_PAGE_TITLE_SIZE}>
              Fight for Crypto Rights
            </PageTitle>
            <p className="text-xl">
              Join to show your support, collect advocacy NFTs, and protect the future of crypto.
              #StandWithCrypto
            </p>
            <HeroCTA />
          </div>
          <div className="mb-10 grid max-w-xl flex-shrink-0 grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-3 sm:space-y-6">
              <ExternalLink className={footerLinkStyles} href={externalUrls.twitter()}>
                Twitter / X
              </ExternalLink>
              <ExternalLink className={footerLinkStyles} href={externalUrls.youtube()}>
                Youtube
              </ExternalLink>
              <ExternalLink className={footerLinkStyles} href={externalUrls.instagram()}>
                Instagram
              </ExternalLink>
              <ExternalLink className={footerLinkStyles} href={externalUrls.facebook()}>
                Facebook
              </ExternalLink>
              <ExternalLink className={footerLinkStyles} href={externalUrls.linkedin()}>
                LinkedIn
              </ExternalLink>
              <ExternalLink className={footerLinkStyles} href={externalUrls.discord()}>
                Discord
              </ExternalLink>
              <ExternalLink className={footerLinkStyles} href={externalUrls.emailFeedback()}>
                Send feedback
              </ExternalLink>
            </div>
            <div className="space-y-3 sm:space-y-6">
              <InternalLink className={footerLinkStyles} href={urls.termsOfService()}>
                Terms of service
              </InternalLink>
              <InternalLink className={footerLinkStyles} href={urls.privacyPolicy()}>
                Privacy Policy
              </InternalLink>
              <CookieConsentFooterButton
                className={cn(footerLinkStyles, 'h-auto text-wrap p-0 text-left text-base')}
                variant={'link'}
              />
              <InternalLink className={footerLinkStyles} href={urls.contribute()}>
                Contribute
              </InternalLink>
              <InternalLink className={footerLinkStyles} href={urls.questionnaire()}>
                Questionnaire
              </InternalLink>
              <InternalLink className={footerLinkStyles} href={urls.leaderboard()}>
                Community
              </InternalLink>
              <InternalLink className={footerLinkStyles} href={urls.resources()}>
                FIT21 resources
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
