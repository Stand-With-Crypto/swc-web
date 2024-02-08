'use client'
import { Dialog, DialogContent, DialogProps, DialogTrigger } from '@/components/ui/dialog'
import { NextImage } from '@/components/ui/image'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useDialog } from '@/hooks/useDialog'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { ConnectEmbed, ConnectEmbedProps, lightTheme } from '@thirdweb-dev/react'
import { useRouter } from 'next/navigation'
import React from 'react'

export function ThirdwebLoginDialog({
  children,
  ...props
}: Omit<DialogProps, 'analytics'> & {
  analytics?: DialogProps['analytics']
  children: React.ReactNode
}) {
  const dialogProps = useDialog({ analytics: 'Login' })
  const router = useRouter()
  return (
    <Dialog {...dialogProps} {...props}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-l w-full">
        <ThirdwebLoginContent
          auth={{
            onLogin: () => {
              // ensure that any server components on the page that's being used are refreshed with the context the user is now logged in
              router.refresh()
              dialogProps.onOpenChange(false)
            },
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

export function ThirdwebLoginContent(props: ConnectEmbedProps) {
  const urls = useIntlUrls()
  return (
    <div>
      <div className="mx-auto flex max-w-[460px] flex-col items-center gap-8">
        <div className="flex flex-col items-center space-y-6">
          <NextImage
            priority
            width={80}
            height={80}
            src="/logo/shield.svg"
            alt="Stand With Crypto Logo"
          />

          <div className="space-y-4">
            <PageTitle size="sm">Join Stand With Crypto</PageTitle>
            <PageSubTitle size="sm">
              Lawmakers and regulators are threatening the crypto industry. You can fight back and
              ask for sensible rules. Join the Stand with Crypto movement to make your voice heard
              in Washington D.C.
            </PageSubTitle>
          </div>
        </div>

        <ThirdwebLoginEmbedded {...props} />

        <p className="text-center text-xs text-muted-foreground">
          By signing up, I understand that Stand With Crypto and its vendors may collect and use my
          Personal Information. To learn more, visit the{' '}
          <InternalLink className="text-blue-600" target="_blank" href={urls.privacyPolicy()}>
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
  return (
    <ConnectEmbed
      style={{ border: 'none' }}
      theme={lightTheme({
        colors: {
          accentText: '#0f172a',
          accentButtonBg: '#0f172a',
          borderColor: '#e2e8f0',
          separatorLine: '#e2e8f0',
          primaryText: '#020817',
          secondaryText: '#64748b',
          secondaryButtonText: '#0f172a',
          secondaryButtonBg: '#f1f5f9',
          connectedButtonBg: '#f1f5f9',
          connectedButtonBgHover: '#e4e2e4',
          walletSelectorButtonHoverBg: '#0f172a',
          secondaryIconColor: '#706f78',
        },
      })}
      {...props}
    />
  )
}
