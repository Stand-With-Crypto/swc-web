'use client'
import { useEffect, useRef, useState } from 'react'
import { ConnectEmbed, ConnectEmbedProps } from '@thirdweb-dev/react'

import { ANALYTICS_NAME_LOGIN } from '@/components/app/authentication/constants'
import { DialogBody, DialogFooterCTA } from '@/components/ui/dialog'
import { NextImage } from '@/components/ui/image'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useThirdwebAuthUser } from '@/hooks/useAuthUser'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { trackSectionVisible } from '@/utils/web/clientAnalytics'
import { theme } from '@/utils/web/thirdweb/theme'

export interface ThirdwebLoginContentProps extends ConnectEmbedProps {
  initialEmailAddress?: string | null
  title?: React.ReactNode
  subtitle?: React.ReactNode
}

const DEFAULT_TITLE = 'Join Stand With Crypto'
const DEFAULT_SUBTITLE =
  'Lawmakers and regulators are threatening the crypto industry. You can fight back and ask for sensible rules. Join the Stand With Crypto movement to make your voice heard in Washington D.C.'

export function ThirdwebLoginContent({
  initialEmailAddress,
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  ...props
}: ThirdwebLoginContentProps) {
  const urls = useIntlUrls()
  const thirdwebEmbeddedAuthContainer = useRef<HTMLDivElement>(null)
  const [hasSignInWithEmail, setHasSignInWithEmail] = useState(false)

  // Add click event on the button to switch between email and phone number so we control legalese text
  useEffect(() => {
    const buttons = document.querySelectorAll('button')
    const possibleSignInWithEmailButton = Array.from(buttons).find(
      button => button.textContent?.trim().toLowerCase() === 'sign in with email',
    ) as HTMLButtonElement
    const possibleSignInWithPhoneButton = Array.from(buttons).find(
      button => button.textContent?.trim().toLowerCase() === 'sign in with phone number',
    ) as HTMLButtonElement

    const handleClick = () => {
      setHasSignInWithEmail(prevState => !prevState)
    }

    if (possibleSignInWithEmailButton) {
      possibleSignInWithEmailButton.addEventListener('click', handleClick)
    }

    if (possibleSignInWithPhoneButton) {
      possibleSignInWithPhoneButton.addEventListener('click', handleClick)
    }

    return () => {
      if (possibleSignInWithEmailButton) {
        possibleSignInWithEmailButton.removeEventListener('click', handleClick)
      }

      if (possibleSignInWithPhoneButton) {
        possibleSignInWithPhoneButton.removeEventListener('click', handleClick)
      }
    }
  }, [hasSignInWithEmail])

  useEffect(() => {
    if (!initialEmailAddress) {
      return
    }

    // const input =
    //   thirdwebEmbeddedAuthContainer.current?.querySelector<HTMLInputElement>('input[type="email"]')
    // if (input && !input.getAttribute('value')) {
    //   input.setAttribute('value', initialEmailAddress)
    // }
  }, [initialEmailAddress])

  const FooterSigninLegalese = () =>
    hasSignInWithEmail ? (
      <>
        By signing up, I understand that Stand With Crypto and its vendors may collect and use my
        Personal Information. To learn more, visit the{' '}
        <InternalLink href={urls.privacyPolicy()} target="_blank">
          Stand With Crypto Alliance Privacy Policy
        </InternalLink>{' '}
        and{' '}
        <ExternalLink href="https://www.quorum.us/privacy-policy/">
          Quorum Privacy Policy
        </ExternalLink>
      </>
    ) : (
      <span className="text-[9px]">
        By signing up with my phone number, you consent to receive recurring texts from Stand with
        Crypto. You can reply STOP to stop receiving texts. Message and data rates may apply. You
        understand that Stand With Crypto and its vendors may collect and use your Personal
        Information. To learn more, visit the{' '}
        <InternalLink href={urls.privacyPolicy()} target="_blank">
          Stand With Crypto Alliance Privacy Policy
        </InternalLink>{' '}
        and{' '}
        <ExternalLink href="https://www.quorum.us/privacy-policy/">
          Quorum Privacy Policy
        </ExternalLink>
      </span>
    )

  return (
    <>
      <DialogBody className="-mt-8">
        <div className="mx-auto flex max-w-[460px] flex-col items-center gap-2">
          <div className="flex flex-col items-center space-y-6">
            <NextImage
              alt="Stand With Crypto Logo"
              height={80}
              priority
              src="/logo/shield.svg"
              width={80}
            />

            <div className="space-y-4">
              <PageTitle size="sm">{title}</PageTitle>
              <PageSubTitle size="sm">{subtitle}</PageSubTitle>
            </div>
          </div>

          <div
            className="w-full"
            ref={thirdwebEmbeddedAuthContainer}
            // if someone enters a super long email, the component will overflow on the "enter confirmation code" screen
            // this prevents that bug
            style={{ maxWidth: 'calc(100vw - 56px)' }}
          >
            <ThirdwebLoginEmbedded {...props} />
          </div>
        </div>

        <DialogFooterCTA className="mt-auto px-6 pb-2">
          <p className="text-center text-xs text-muted-foreground">
            <FooterSigninLegalese />
          </p>
        </DialogFooterCTA>
      </DialogBody>
    </>
  )
}

function ThirdwebLoginEmbedded(props: ConnectEmbedProps) {
  const session = useThirdwebAuthUser()
  const hasTracked = useRef(false)
  useEffect(() => {
    if (!session.isLoggedIn && !session.isLoading && !hasTracked.current) {
      trackSectionVisible({ sectionGroup: ANALYTICS_NAME_LOGIN, section: 'Login' })
      hasTracked.current = true
    }
  }, [session.isLoading, session.isLoggedIn])

  if (session.isLoggedIn) {
    return (
      <div className="h-80">
        <LoadingOverlay />
      </div>
    )
  }

  return (
    <ConnectEmbed
      showThirdwebBranding={false}
      style={{ border: 'none', maxWidth: 'unset' }}
      theme={theme}
      {...props}
    />
  )
}
