'use client'
import React from 'react'
import { ConnectEmbed, ConnectEmbedProps } from '@thirdweb-dev/react'

import { NextImage } from '@/components/ui/image'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { useThirdwebData } from '@/hooks/useThirdwebData'
import { theme } from '@/utils/web/thirdweb/theme'

export function ThirdwebLoginContent(props: ConnectEmbedProps) {
  const urls = useIntlUrls()

  return (
    <div>
      <div className="mx-auto flex max-w-[460px] flex-col items-center gap-8">
        <div className="flex flex-col items-center space-y-6">
          <NextImage
            alt="Stand With Crypto Logo"
            height={80}
            priority
            src="/logo/shield.svg"
            width={80}
          />

          <div className="space-y-4">
            <PageTitle size="sm">Join Stand With Crypto</PageTitle>
            <PageSubTitle size="sm">
              Lawmakers and regulators are threatening the crypto industry. You can fight back and
              ask for sensible rules. Join the Stand With Crypto movement to make your voice heard
              in Washington D.C.
            </PageSubTitle>
          </div>
        </div>

        <ThirdwebLoginEmbedded {...props} />

        <p className="text-center text-xs text-muted-foreground">
          By signing up, I understand that Stand With Crypto and its vendors may collect and use my
          Personal Information. To learn more, visit the{' '}
          <InternalLink className="text-blue-600" href={urls.privacyPolicy()} target="_blank">
            Stand With Crypto Alliance Privacy Policy
          </InternalLink>{' '}
          and{' '}
          <ExternalLink
            className="text-blue-600"
            href="https://www.quorum.us/static/Privacy-Policy.pdf"
          >
            Quorum Privacy Policy
          </ExternalLink>
        </p>
      </div>
    </div>
  )
}

function ThirdwebLoginEmbedded(props: ConnectEmbedProps) {
  const { session } = useThirdwebData()

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
